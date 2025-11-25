// File: server/Controllers/appointmentController.js
const { Op } = require('sequelize');
const { Appointment, Patient, Doctor, User, Recordatorio, EstadoCita, TipoCita, ConfCita, EstadoBitacoraRecordatorio } = require('../Models');
const { APPOINTMENT_STATUS, canTransitionTo, isValidStatus, getValidTransitions } = require('../Config/appointmentStatus');
const { CITA_ESTADOS, getEstadoNombreById, getEstadoIdByNombre } = require('../Config/statusCodes');
const appointmentService = require('../services/appointmentService');
const bitacoraService = require('../services/bitacoraService');
const logger = require('../utils/logger');
const { registrarEstadoRecordatorio, ESTADOS_RECORDATORIO } = require('../utils/reminderUtils');

// Helper to fetch appointment with common associations.
// If the DB is missing the `tbl_conf_cita` table, retry without the Confirmaciones association.
async function fetchAppointmentWithPossibleMissingConf(id, includeConf = true) {
  const baseIncludes = [
    { model: Patient, as: 'Patient' },
    { model: Doctor, as: 'Doctor' },
    { model: User, as: 'User' },
    {
      model: Recordatorio,
      as: 'Recordatorios',
      include: [{ model: EstadoBitacoraRecordatorio, as: 'EstadosRecordatorio' }]
    },
    { model: EstadoCita, as: 'EstadoCita' },
    { model: TipoCita, as: 'TipoCita' }
  ];

  try {
    const includes = includeConf && ConfCita ? [...baseIncludes, { model: ConfCita, as: 'Confirmaciones' }] : baseIncludes;
    return await Appointment.findByPk(id, { include: includes });
  } catch (err) {
    // If the error indicates the confirmaciones table is missing, retry without it
    const parentCode = err && err.parent && err.parent.code;
    const sqlMessage = err && err.parent && err.parent.sqlMessage;
    const sql = err && err.parent && err.parent.sql;
    if ((parentCode === 'ER_NO_SUCH_TABLE' || (sqlMessage && sqlMessage.includes("doesn't exist"))) && (sql && sql.includes('tbl_conf_cita'))) {
      // Retry without Confirmaciones
      return await Appointment.findByPk(id, { include: baseIncludes });
    }
    throw err;
  }
}

// Helper to fetch multiple appointments in a date range with the same defensive behavior
async function fetchAppointmentsInRangeWithPossibleMissingConf(start, end, includeConf = true) {
  const baseIncludes = [
    { model: Patient, as: 'Patient' },
    { model: Doctor, as: 'Doctor' },
    { model: User, as: 'User' },
    {
      model: Recordatorio,
      as: 'Recordatorios',
      include: [{ model: EstadoBitacoraRecordatorio, as: 'EstadosRecordatorio' }]
    },
    { model: EstadoCita, as: 'EstadoCita' },
    { model: TipoCita, as: 'TipoCita' }
  ];

  try {
    const includes = includeConf && ConfCita ? [...baseIncludes, { model: ConfCita, as: 'Confirmaciones' }] : baseIncludes;
    return await Appointment.findAll({
      where: { atr_fecha_cita: { [require('sequelize').Op.between]: [start, end] } },
      include: includes,
      order: [['atr_fecha_cita', 'ASC'], ['atr_hora_cita', 'ASC']]
    });
  } catch (err) {
    const parentCode = err && err.parent && err.parent.code;
    const sqlMessage = err && err.parent && err.parent.sqlMessage;
    const sql = err && err.parent && err.parent.sql;
    if ((parentCode === 'ER_NO_SUCH_TABLE' || (sqlMessage && sqlMessage.includes("doesn't exist"))) && (sql && sql.includes('tbl_conf_cita'))) {
      return await Appointment.findAll({
        where: { atr_fecha_cita: { [require('sequelize').Op.between]: [start, end] } },
        include: baseIncludes,
        order: [['atr_fecha_cita', 'ASC'], ['atr_hora_cita', 'ASC']]
      });
    }
    throw err;
  }
}

module.exports = {
  async createAppointment(req, res, next) {
    try {
      const userId = req.user.id;
      const { pacienteId, medicoId, fecha, hora, tipoCita, motivo, duracion, usuarioId, usuario } = req.body;

      // Allow optional overriding of the creating user via payload (`usuarioId` or `usuario`).
      // Robustly parse incoming values and fallback to authenticated user ID when not provided or invalid.
      const tryParseInt = (v) => {
        if (v === undefined || v === null) return null;
        const n = parseInt(v, 10);
        return Number.isInteger(n) ? n : null;
      };

      const parsedUsuarioId = tryParseInt(usuarioId);
      const parsedUsuario = tryParseInt(usuario);
      // Also accept string numeric IDs from the authenticated user object
      const parsedAuthUserId = tryParseInt(userId);
      const creatorId = parsedUsuarioId ?? parsedUsuario ?? parsedAuthUserId ?? null;

      if (!creatorId) {
        // Log useful details for mapping/reporting
        logger.warn('createAppointment: no se pudo identificar usuario creador', {
          reqUser: req.user,
          bodyUsuarioId: usuarioId,
          bodyUsuario: usuario
        });
        return res.status(400).json({ error: 'No se pudo identificar el usuario creador de la cita' });
      }

      // Llamar al servicio para crear la cita
      const appointment = await appointmentService.createAppointment({
        pacienteId,
        medicoId,
        fecha,
        hora,
        tipoCita,
        motivo,
        duracion,
        userId: creatorId
      });

      // Obtener la cita con relaciones
      const appointmentWithRelations = await Appointment.findByPk(appointment.atr_id_cita, {
        include: [
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' },
          { model: User, as: 'User' },
          { model: Recordatorio, as: 'Recordatorios' },
          { model: EstadoCita, as: 'EstadoCita' },
          { model: TipoCita, as: 'TipoCita' }
        ]
      });

      // Registrar en Bitácora
      await bitacoraService.registrarEvento({
        atr_id_usuario: userId,
        atr_id_objetos: appointment.atr_id_cita,
        atr_accion: 'Crear',
        atr_descripcion: `Cita creada para paciente ${pacienteId} con médico ${medicoId} en fecha ${fecha} ${hora}`,
        ip_origen: req.ip
      });

      res.status(201).json({ success: true, data: appointmentWithRelations });
    } catch (err) {
      logger.error('Error creando cita', err);
      if (err.message.includes('Paciente no encontrado') || err.message.includes('Médico no encontrado') || err.message.includes('horario') || err.message.includes('Conflicto')) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  },

  async listAppointments(req, res, next) {
    try {
      const { fechaDesde, fechaHasta, estado, medicoId, pacienteId, limit, offset, sortBy, sortOrder } = req.query;

      const filters = {
        fechaDesde,
        fechaHasta,
        estado,
        medicoId,
        pacienteId,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
        sortBy: sortBy || 'atr_fecha_cita',
        sortOrder: sortOrder || 'DESC'
      };

      const appointments = await appointmentService.listAppointments(filters);

      res.json({ success: true, data: appointments });
    } catch (err) {
      logger.error('Error listando citas', err);
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const appointment = await fetchAppointmentWithPossibleMissingConf(id, true);
      
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }
      
      res.json({ success: true, data: appointment });
    } catch (err) {
      logger.error('Error obtener cita', err);
      next(err);
    }
  },

  async updateAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const appointment = await Appointment.findByPk(id, {
        include: [
          { model: EstadoCita, as: 'EstadoCita' }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Verificar que el estado no sea final
      const currentStatus = appointment.EstadoCita?.atr_nombre_estado;
      const finalStatuses = [APPOINTMENT_STATUS.FINALIZADA, APPOINTMENT_STATUS.CANCELADA, APPOINTMENT_STATUS.NO_ASISTIO];
      if (finalStatuses.includes(currentStatus)) {
        return res.status(400).json({ error: `No se puede editar una cita en estado ${currentStatus}` });
      }

      // Llamar al servicio para actualizar
      const updatedAppointment = await appointmentService.updateAppointment(id, updateData);

      res.json({ success: true, data: updatedAppointment });
    } catch (err) {
      logger.error('Error actualizar cita', err);
      if (err.message.includes('Paciente no encontrado') || err.message.includes('Médico no encontrado') || err.message.includes('horario') || err.message.includes('Conflicto')) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }
      
      // Eliminar recordatorio asociado
      await Recordatorio.destroy({
        where: { atr_id_cita: id }
      });
      
      // Eliminar la cita
      await appointment.destroy();
      
      res.json({ success: true, message: 'Cita eliminada exitosamente' });
    } catch (err) {
      logger.error('Error eliminar cita', err);
      next(err);
    }
  },

  async confirm(req, res, next) {
    try {
      const { id } = req.params;

      const appointment = await fetchAppointmentWithPossibleMissingConf(id, true);

      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Validar transición de estado usando la máquina de estados
      const currentStatus = appointment.EstadoCita?.atr_nombre_estado;
      if (!canTransitionTo(currentStatus, APPOINTMENT_STATUS.CONFIRMADA)) {
        return res.status(400).json({
          error: `No se puede confirmar la cita. Estado actual: ${currentStatus || 'Desconocido'}. Transiciones válidas: ${getValidTransitions(currentStatus).join(', ')}`
        });
      }

      // Usar función helper para obtener el ID del estado CONFIRMADA
      const confirmadaId = getEstadoIdByNombre(APPOINTMENT_STATUS.CONFIRMADA);
      await appointment.update({ atr_id_estado: confirmadaId });

      const updatedAppointment = await fetchAppointmentWithPossibleMissingConf(id, true);

      res.json({ success: true, data: updatedAppointment });
    } catch (err) {
      logger.error('Error confirmar cita', err);
      next(err);
    }
  },

  async reschedule(req, res, next) {
    try {
      const { id } = req.params;
      const { nuevaFecha, nuevaHora, motivo, recordatorio } = req.body;
      const userId = req.user.id;

      const updatedAppointment = await appointmentService.reschedule(id, { nuevaFecha, nuevaHora, motivo, userId, recordatorio });

      res.json({ success: true, data: updatedAppointment });
    } catch (err) {
      logger.error('Error reprogramar cita', err);
      if (err.message.includes('Paciente no encontrado') || err.message.includes('Médico no encontrado') || err.message.includes('horario') || err.message.includes('Conflicto')) {
        return res.status(400).json({ error: err.message });
      }
      next(err);
    }
  },

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const appointment = await fetchAppointmentWithPossibleMissingConf(id, true);

      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Validar transición de estado usando la máquina de estados
      const currentStatus = appointment.EstadoCita?.atr_nombre_estado;
      if (!canTransitionTo(currentStatus, APPOINTMENT_STATUS.CANCELADA)) {
        return res.status(400).json({
          error: `No se puede cancelar la cita. Estado actual: ${currentStatus || 'Desconocido'}. Transiciones válidas: ${getValidTransitions(currentStatus).join(', ')}`
        });
      }

      // Usar función helper para obtener el ID del estado CANCELADA
      const canceladaId = getEstadoIdByNombre(APPOINTMENT_STATUS.CANCELADA);
      await appointment.update({
        atr_id_estado: canceladaId,
        atr_motivo_cita: `${appointment.atr_motivo_cita} - CANCELADA: ${reason || 'Sin motivo especificado'}`
      });

      const updatedAppointment = await fetchAppointmentWithPossibleMissingConf(id, true);

      res.json({ success: true, data: updatedAppointment });
    } catch (err) {
      logger.error('Error cancelar cita', err);
      next(err);
    }
  },

  async getPatients(req, res, next) {
    try {
      // Some schemas do not include an 'estado' column on paciente.
      // Fetch basic identifying fields without filtering by a missing column.
      const patients = await Patient.findAll({
        attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido'],
        order: [['atr_nombre', 'ASC']]
      });
      
      const formattedPatients = patients.map(patient => ({
        value: patient.atr_id_paciente,
        label: `${patient.atr_nombre} ${patient.atr_apellido}`
      }));
      
      res.json({ success: true, data: formattedPatients });
    } catch (err) {
      logger.error('Error obtener pacientes', err);
      next(err);
    }
  },

  async getDoctors(req, res, next) {
    try {
      // Some schemas do not include an 'estado' column on medico.
      // Fetch basic identifying fields without filtering by a missing column.
      const doctors = await Doctor.findAll({
        attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
        order: [['atr_nombre', 'ASC']]
      });
      
      const formattedDoctors = doctors.map(doctor => ({
        value: doctor.atr_id_medico,
        label: `Dr. ${doctor.atr_nombre} ${doctor.atr_apellido}`
      }));
      
      res.json({ success: true, data: formattedDoctors });
    } catch (err) {
      logger.error('Error obtener médicos', err);
      next(err);
    }
  },

  async getAppointmentStates(req, res, next) {
    try {
      const states = await EstadoCita.findAll({
        attributes: ['atr_id_estado', 'atr_nombre_estado', 'atr_descripcion'],
        order: [['atr_id_estado', 'ASC']]
      });
      
      const formattedStates = states.map(state => ({
        value: state.atr_id_estado,
        label: state.atr_nombre_estado,
        description: state.atr_descripcion
      }));
      
      res.json({ success: true, data: formattedStates });
    } catch (err) {
      logger.error('Error obtener estados de cita', err);
      next(err);
    }
  },

  async getAppointmentTypes(req, res, next) {
    try {
      // Some schemas for TipoCita do not include an 'atr_descripcion' column.
      // Select available fields and map a fallback description from other fields if present.
      const types = await TipoCita.findAll({
        attributes: ['atr_id_tipo_cita', 'atr_nombre_tipo_cita', 'atr_area'],
        order: [['atr_id_tipo_cita', 'ASC']]
      });

      const formattedTypes = types.map(type => ({
        value: type.atr_id_tipo_cita,
        label: type.atr_nombre_tipo_cita,
        description: type.atr_descripcion || type.atr_area || ''
      }));
      
      res.json({ success: true, data: formattedTypes });
    } catch (err) {
      logger.error('Error obtener tipos de cita', err);
      next(err);
    }
  },

  async getTodayAppointments(req, res, next) {
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      const where = { atr_fecha_cita: todayStr };

      // opcional: filtro por médico logueado
      if (req.user && req.user.rol === 'MEDICO') {
        where.atr_id_medico = req.user.atr_id_medico;
      }

      const citas = await Appointment.findAll({
        where,
        include: [
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' },
          { model: EstadoCita, as: 'EstadoCita' },
          { model: TipoCita, as: 'TipoCita' }
        ],
        order: [['atr_hora_cita', 'ASC']],
      });

      res.json({ success: true, data: citas });
    } catch (err) {
      logger.error('Error obtener citas del día', err);
      next(err);
    }
  },

  async getCalendarAppointments(req, res, next) {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        return res.status(400).json({
          error: 'Parámetros start y end son requeridos'
        });
      }

      // Obtener citas en el rango de fechas (defensively handle missing tbl_conf_cita)
      let appointments = await fetchAppointmentsInRangeWithPossibleMissingConf(start, end, true);

      // Formatear para FullCalendar
      const calendarEvents = appointments.map(appointment => {
        const startDate = new Date(`${appointment.atr_fecha_cita} ${appointment.atr_hora_cita}`);
        const duration = appointment.atr_duracion || 60; // 60 minutos por defecto
        const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

        return {
          id: String(appointment.atr_id_cita),
          title: `${appointment.Patient?.atr_nombre || ''} ${appointment.Patient?.atr_apellido || ''} - ${appointment.atr_motivo_cita}`,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          extendedProps: {
            appointment: appointment,
            patient: appointment.Patient,
            doctor: appointment.Doctor,
            status: appointment.atr_id_estado,
            statusName: appointment.EstadoCita?.atr_nombre_estado,
            type: appointment.TipoCita?.atr_nombre_tipo_cita,
            motivo: appointment.atr_motivo_cita,
            duration: duration
          }
        };
      });

      res.json({ success: true, data: calendarEvents });
    } catch (err) {
      logger.error('Error obtener citas del calendario', err);
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Estado es requerido' });
      }

      // Validar que el estado sea válido
      if (!isValidStatus(status)) {
        return res.status(400).json({
          error: `Estado no válido: ${status}. Estados válidos: ${Object.values(APPOINTMENT_STATUS).join(', ')}`
        });
      }

      const appointment = await Appointment.findByPk(id, {
        include: [
          { model: EstadoCita, as: 'EstadoCita' },
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' },
          { model: TipoCita, as: 'TipoCita' }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Verificar transición válida
      const currentStatus = appointment.EstadoCita?.atr_nombre_estado;
      if (!canTransitionTo(currentStatus, status)) {
        return res.status(400).json({
          error: `Transición no válida. De ${currentStatus || 'Desconocido'} a ${status}. Transiciones válidas: ${getValidTransitions(currentStatus).join(', ')}`
        });
      }

      // Usar función helper para obtener el ID del estado
      const newStatusId = getEstadoIdByNombre(status);
      if (!newStatusId) {
        return res.status(400).json({ error: `ID de estado no encontrado para: ${status}` });
      }

      // Actualizar el estado
      await appointment.update({ atr_id_estado: newStatusId });

      // Obtener la cita actualizada
      const updatedAppointment = await fetchAppointmentWithPossibleMissingConf(id, true);

      // Registrar en bitácora
      await bitacoraService.registrarEvento({
        atr_id_usuario: req.user.id,
        atr_id_objetos: id,
        atr_accion: 'Actualizar Estado',
        atr_descripcion: `Estado de cita cambiado de ${currentStatus} a ${status}`,
        ip_origen: req.ip
      });

      res.json({ success: true, data: updatedAppointment });
    } catch (err) {
      logger.error('Error actualizar estado de cita', err);
      next(err);
    }
  },

  async registerConfirmation(req, res, next) {
    try {
      const { id } = req.params;
      const { metodo_confirmacion, estado_confirmacion, observaciones } = req.body;
      const userId = req.user.id;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Registrar confirmación
      const confirmation = await ConfCita.create({
        id_cita: id,
        metodo_confirmacion,
        estado_confirmacion,
        observaciones
      });

      // Obtener confirmación con relaciones
      const confirmationWithRelations = await ConfCita.findByPk(confirmation.id_conf_cita, {
        include: [{ model: Appointment, as: 'Appointment' }]
      });

      // Registrar en bitácora
      await bitacoraService.registrarEvento({
        atr_id_usuario: userId,
        atr_id_objetos: id,
        atr_accion: 'Registrar Confirmación',
        atr_descripcion: `Confirmación registrada vía ${metodo_confirmacion} con estado ${estado_confirmacion}`,
        ip_origen: req.ip
      });

      res.json({ success: true, data: confirmationWithRelations });
    } catch (err) {
      logger.error('Error registrando confirmación', err);
      next(err);
    }
  },

  async registerReminder(req, res, next) {
    try {
      const { id } = req.params;
      const { fechaHoraEnvio, medio } = req.body;
      const userId = req.user.id;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Crear recordatorio
      const reminder = await Recordatorio.create({
        atr_id_cita: id,
        atr_fecha_hora_envio: fechaHoraEnvio,
        atr_medio: medio
      });

      // Registrar en bitácora
      await bitacoraService.registrarEvento({
        atr_id_usuario: userId,
        atr_id_objetos: id,
        atr_accion: 'Registrar Recordatorio',
        atr_descripcion: `Recordatorio registrado para envío en ${fechaHoraEnvio} vía ${medio}`,
        ip_origen: req.ip
      });

      res.json({ success: true, data: reminder });
    } catch (err) {
      logger.error('Error registrando recordatorio', err);
      next(err);
    }
  },

  async createReminder(req, res, next) {
    try {
      const { id } = req.params;
      const idCita = id; // ID de la cita
      const { medio = 'email' } = req.body; // Default a 'email' si no viene
      const userId = req.user.id;

      // Tarea 2.2.1 – Validar la cita
      const appointment = await Appointment.findByPk(idCita, {
        include: [
          { model: EstadoCita, as: 'EstadoCita' },
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Verificar que la cita está en un estado donde tenga sentido enviar recordatorio
      const currentStatus = appointment.EstadoCita?.atr_nombre_estado;
      const validStatuses = [APPOINTMENT_STATUS.PROGRAMADA, APPOINTMENT_STATUS.CONFIRMADA];

      if (!validStatuses.includes(currentStatus)) {
        return res.status(400).json({
          error: `No se puede crear recordatorio para cita en estado ${currentStatus}. Estados válidos: ${validStatuses.join(', ')}`
        });
      }

      // Validar medio
      const validMedios = ['sms', 'email', 'notificación app'];
      if (!validMedios.includes(medio)) {
        return res.status(400).json({
          error: `Medio no válido: ${medio}. Medios válidos: ${validMedios.join(', ')}`
        });
      }

      // Tarea 2.2.2 – Insertar en tbl_recordatorio
      const recordatorio = await Recordatorio.create({
        atr_id_cita: idCita,
        atr_fecha_hora_envio: new Date(), // ahora
        atr_medio: medio,
      });

      // Insertar primera fila en bitácora - Estado inicial
      try {
        // Aquí iría la lógica real de envío (email, SMS, etc.)
        // Por ahora simulamos envío exitoso
        await registrarEstadoRecordatorio(
          recordatorio.atr_id_recordatorio,
          ESTADOS_RECORDATORIO.ENVIADO,
          'Recordatorio enviado manualmente',
          false
        );
      } catch (envioError) {
        // Si el envío falla, registrar estado ERROR
        await registrarEstadoRecordatorio(
          recordatorio.atr_id_recordatorio,
          ESTADOS_RECORDATORIO.ERROR,
          `No se pudo entregar el recordatorio: ${envioError.message}`,
          false
        );

        // Podrías lanzar el error o manejarlo según la lógica de negocio
        throw envioError;
      }

      // Registrar en bitácora general
      await bitacoraService.registrarEvento({
        atr_id_usuario: userId,
        atr_id_objetos: idCita,
        atr_accion: 'Crear Recordatorio Manual',
        atr_descripcion: `Recordatorio creado manualmente para envío inmediato vía ${medio}`,
        ip_origen: req.ip
      });

      // Tarea 2.2.4 – Respuesta del endpoint
      res.json({
        message: "Recordatorio generado",
        recordatorio: {
          id: recordatorio.atr_id_recordatorio,
          citaId: recordatorio.atr_id_cita,
          medio: recordatorio.atr_medio,
          fechaHoraEnvio: recordatorio.atr_fecha_hora_envio
        }
      });
    } catch (err) {
      logger.error('Error creando recordatorio manual', err);
      next(err);
    }
  },

  async getReminders(req, res, next) {
    try {
      const { id } = req.params;
      const idCita = id; // ID de la cita

      // Verificar que la cita existe
      const appointment = await Appointment.findByPk(idCita);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Tarea 2.3.1 – Buscar todos los recordatorios por cita
      const recordatorios = await Recordatorio.findAll({
        where: { atr_id_cita: idCita },
        include: [{
          model: EstadoBitacoraRecordatorio,
          as: 'EstadosRecordatorio',
          order: [['atr_id_estado_recordatorio', 'ASC']],
        }],
        order: [['atr_fecha_hora_envio', 'DESC']],
      });

      // Tarea 2.3.2 – Mapear respuesta amigable para frontend
      const respuesta = recordatorios.map(recordatorio => ({
        idRecordatorio: recordatorio.atr_id_recordatorio,
        fechaHoraEnvio: recordatorio.atr_fecha_hora_envio,
        medio: recordatorio.atr_medio,
        estados: recordatorio.EstadosRecordatorio.map(estado => ({
          idEstado: estado.atr_id_estado_recordatorio,
          estado: estado.atr_estado_recordatorio,
          contenido: estado.atr_contenido,
          cancelacion: estado.atr_cancelacion
        }))
      }));

      res.json({ success: true, data: respuesta });
    } catch (err) {
      logger.error('Error obteniendo historial de recordatorios', err);
      next(err);
    }
  },

  async cancelReminder(req, res, next) {
    try {
      const { id, reminderId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      // Verificar que la cita existe
      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Verificar que el recordatorio existe y pertenece a la cita
      const recordatorio = await Recordatorio.findOne({
        where: {
          atr_id_recordatorio: reminderId,
          atr_id_cita: id
        }
      });

      if (!recordatorio) {
        return res.status(404).json({ error: 'Recordatorio no encontrado para esta cita' });
      }

      // Tarea 2.4.2 – Usar función de utilidad para cancelación
      await registrarEstadoRecordatorio(
        recordatorio.atr_id_recordatorio,
        ESTADOS_RECORDATORIO.CANCELADO,
        `Recordatorio cancelado: ${reason || 'Sin motivo especificado'}`,
        true // cancelacion = true
      );

      // Registrar en bitácora general
      await bitacoraService.registrarEvento({
        atr_id_usuario: userId,
        atr_id_objetos: id,
        atr_accion: 'Cancelar Recordatorio',
        atr_descripcion: `Recordatorio ${reminderId} cancelado: ${reason || 'Sin motivo especificado'}`,
        ip_origen: req.ip
      });

      res.json({
        success: true,
        message: 'Recordatorio cancelado exitosamente'
      });
    } catch (err) {
      logger.error('Error cancelando recordatorio', err);
      next(err);
    }
  },

  async updateReminderStatus(req, res, next) {
    try {
      const { id, reminderId } = req.params;
      const { estado, contenido } = req.body;
      const userId = req.user.id;

      // Verificar que la cita existe
      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Verificar que el recordatorio existe y pertenece a la cita
      const recordatorio = await Recordatorio.findOne({
        where: {
          atr_id_recordatorio: reminderId,
          atr_id_cita: id
        }
      });

      if (!recordatorio) {
        return res.status(404).json({ error: 'Recordatorio no encontrado para esta cita' });
      }

      // Validar estado
      const estadosValidos = Object.values(ESTADOS_RECORDATORIO);
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          error: `Estado no válido: ${estado}. Estados válidos: ${estadosValidos.join(', ')}`
        });
      }

      // Tarea 2.4.2 – Usar función de utilidad para actualizar estado
      await registrarEstadoRecordatorio(
        recordatorio.atr_id_recordatorio,
        estado,
        contenido || `Estado actualizado a ${estado}`,
        false
      );

      // Registrar en bitácora general
      await bitacoraService.registrarEvento({
        atr_id_usuario: userId,
        atr_id_objetos: id,
        atr_accion: 'Actualizar Estado Recordatorio',
        atr_descripcion: `Estado del recordatorio ${reminderId} actualizado a ${estado}`,
        ip_origen: req.ip
      });

      res.json({
        success: true,
        message: `Estado del recordatorio actualizado a ${estado}`
      });
    } catch (err) {
      logger.error('Error actualizando estado del recordatorio', err);
      next(err);
    }
  },

  async checkIn(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Buscar la cita
      const appointment = await Appointment.findByPk(id, {
        include: [
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' },
          { model: EstadoCita, as: 'EstadoCita' },
          { model: TipoCita, as: 'TipoCita' }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Verificar que la cita esté en un estado válido para check-in
      const currentStatus = appointment.EstadoCita?.atr_nombre_estado;
      const validStatuses = [APPOINTMENT_STATUS.CONFIRMADA, APPOINTMENT_STATUS.EN_CURSO];

      if (!validStatuses.includes(currentStatus)) {
        return res.status(400).json({
          error: `No se puede hacer check-in de una cita en estado ${currentStatus}. Estados válidos: ${validStatuses.join(', ')}`
        });
      }

      // Verificar que no se haya hecho check-in ya
      if (appointment.atr_fecha_hora_checkin) {
        return res.status(400).json({
          error: 'El paciente ya realizó check-in para esta cita',
          checkInTime: appointment.atr_fecha_hora_checkin
        });
      }

      // Registrar check-in
      const checkInTime = new Date();
      await appointment.update({
        atr_fecha_hora_checkin: checkInTime
      });

      // Cambiar estado a EN_CURSO si estaba CONFIRMADA
      if (currentStatus === APPOINTMENT_STATUS.CONFIRMADA) {
        const enConsultaId = getEstadoIdByNombre(APPOINTMENT_STATUS.EN_CONSULTA);
        await appointment.update({ atr_id_estado: enConsultaId });
      }

      // Obtener cita actualizada
      const updatedAppointment = await Appointment.findByPk(id, {
        include: [
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' },
          { model: User, as: 'User' },
          { model: EstadoCita, as: 'EstadoCita' },
          { model: TipoCita, as: 'TipoCita' }
        ]
      });

      // Registrar en bitácora
      await bitacoraService.registrarEvento({
        atr_id_usuario: userId,
        atr_id_objetos: id,
        atr_accion: 'Check-in Paciente',
        atr_descripcion: `Paciente realizó check-in a las ${checkInTime.toISOString()}`,
        ip_origen: req.ip
      });

      res.json({
        success: true,
        message: 'Check-in registrado exitosamente',
        data: {
          appointment: updatedAppointment,
          checkInTime: checkInTime
        }
      });
    } catch (err) {
      logger.error('Error en check-in de paciente', err);
      next(err);
    }
  },

  async startConsultation(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const appointment = await Appointment.findByPk(id, {
        include: [
          { model: EstadoCita, as: 'EstadoCita' },
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' },
          { model: TipoCita, as: 'TipoCita' }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ error: 'Cita no encontrada' });
      }

      // Verificar que la cita esté en un estado válido para iniciar consulta
      const currentStatus = appointment.EstadoCita?.atr_nombre_estado;
      const validStatuses = [APPOINTMENT_STATUS.PROGRAMADA, APPOINTMENT_STATUS.CONFIRMADA];

      if (!validStatuses.includes(currentStatus)) {
        return res.status(400).json({
          error: `No se puede iniciar consulta desde el estado ${currentStatus}. Estados válidos: ${validStatuses.join(', ')}`
        });
      }

      // Cambiar estado a EN_CONSULTA
      const enConsultaId = getEstadoIdByNombre(APPOINTMENT_STATUS.EN_CONSULTA);
      await appointment.update({ atr_id_estado: enConsultaId });

      // Obtener cita actualizada
      const updatedAppointment = await Appointment.findByPk(id, {
        include: [
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' },
          { model: User, as: 'User' },
          { model: EstadoCita, as: 'EstadoCita' },
          { model: TipoCita, as: 'TipoCita' }
        ]
      });

      // Registrar en bitácora
      await bitacoraService.registrarEvento({
        atr_id_usuario: userId,
        atr_id_objetos: id,
        atr_accion: 'Iniciar Consulta',
        atr_descripcion: `Consulta iniciada desde estado ${currentStatus}`,
        ip_origen: req.ip
      });

      res.json({
        success: true,
        message: 'Consulta iniciada exitosamente',
        data: updatedAppointment
      });
    } catch (err) {
      logger.error('Error iniciando consulta', err);
      next(err);
    }
  },

  async checkInAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const cita = await Appointment.findByPk(id, {
        include: [
          { model: EstadoCita, as: 'EstadoCita' },
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' }
        ]
      });

      if (!cita) {
        return res.status(404).json({ message: 'Cita no encontrada' });
      }

      // Regla: solo permitir check-in si está PROGRAMADA o CONFIRMADA
      const estadosPermitidos = [CITA_ESTADOS.PROGRAMADA, CITA_ESTADOS.CONFIRMADA];
      if (!estadosPermitidos.includes(cita.atr_id_estado)) {
        return res.status(400).json({
          message: 'No se puede hacer check-in en el estado actual de la cita',
        });
      }

      // Verificar que no se haya hecho check-in ya
      if (cita.atr_fecha_hora_checkin) {
        return res.status(400).json({
          message: 'El paciente ya realizó check-in para esta cita',
          checkInTime: cita.atr_fecha_hora_checkin
        });
      }

      // Guardar hora de llegada
      const checkInTime = new Date();
      cita.atr_fecha_hora_checkin = checkInTime;

      // Opcional: al hacer check-in, dejarla en CONFIRMADA si estaba PROGRAMADA
      if (cita.atr_id_estado === CITA_ESTADOS.PROGRAMADA) {
        cita.atr_id_estado = CITA_ESTADOS.CONFIRMADA;
      }

      await cita.save();

      // Obtener cita actualizada con relaciones
      const updatedAppointment = await Appointment.findByPk(id, {
        include: [
          { model: Patient, as: 'Patient' },
          { model: Doctor, as: 'Doctor' },
          { model: EstadoCita, as: 'EstadoCita' },
          { model: TipoCita, as: 'TipoCita' }
        ]
      });

      // Registrar en bitácora
      await bitacoraService.registrarEvento({
        atr_id_usuario: userId,
        atr_id_objetos: id,
        atr_accion: 'Check-in Manual',
        atr_descripcion: `Check-in registrado manualmente a las ${checkInTime.toISOString()}`,
        ip_origen: req.ip
      });

      return res.json({
        success: true,
        message: 'Check-in registrado correctamente',
        data: {
          appointment: updatedAppointment,
          checkInTime: checkInTime
        }
      });
    } catch (err) {
      logger.error('Error en check-in manual de cita', err);
      next(err);
    }
  },

  async getPendingPaymentAppointments(req, res, next) {
    try {
      const { fecha, medicoId } = req.query;

      const citas = await appointmentService.getPendingPayments({
        fecha,
        medicoId,
      });

      res.json({
        success: true,
        data: citas,
      });
    } catch (error) {
      next(error);
    }
  },

  async payAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const usuarioCajaId = req.user?.atr_id_usuario; // viene del authMiddleware
      const { formaPago, referencia, observacion } = req.body || {};

      const citaPagada = await appointmentService.payAppointment(
        id,
        usuarioCajaId,
        { formaPago, referencia, observacion }
      );

      res.json({
        success: true,
        message: 'Cita marcada como FINALIZADA',
        data: citaPagada,
      });
    } catch (error) {
      next(error);
    }
  }
};
