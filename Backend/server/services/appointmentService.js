// File: server/services/appointmentService.js
const { Appointment, Patient, Doctor, User, Recordatorio, EstadoCita, TipoCita, MedicoHorario, ReprogramarCita } = require('../Models');
const { APPOINTMENT_STATUS } = require('../Config/appointmentStatus');
const { CITA_ESTADOS } = require('../Config/statusCodes');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const sequelize = require('../Config/db');
const bitacoraService = require('./bitacoraService');
const { registrarEstadoRecordatorio, ESTADOS_RECORDATORIO } = require('../utils/reminderUtils');

// Helper: parse a date string `YYYY-MM-DD` as a local Date (avoid UTC shift)
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const s = String(dateStr);
  const parts = s.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    return new Date(y, m - 1, d);
  }
  return new Date(dateStr);
};

// Helper: remove diacritics from a string (e.g. 'Miércoles' -> 'Miercoles')
const removeDiacritics = (str) => {
  if (!str) return str;
  try {
    return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch (e) {
    // Fallback (should be equivalent)
    return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
};

// Build a set of possible representations for a weekday to improve matching
const buildDayCandidates = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date)) return [];
  const rawDayES = date.toLocaleDateString('es-ES', { weekday: 'long' });
  const dayES = rawDayES ? (rawDayES.charAt(0).toUpperCase() + rawDayES.slice(1).toLowerCase()) : rawDayES;
  const dayESNoAccent = dayES ? removeDiacritics(dayES) : dayES;
  const dayAbbrevES = dayES ? dayES.slice(0, 3) : null;
  const dayAbbrevESNoAccent = dayAbbrevES ? removeDiacritics(dayAbbrevES) : dayAbbrevES;

  const rawDayEN = date.toLocaleDateString('en-US', { weekday: 'long' });
  const dayEN = rawDayEN ? (rawDayEN.charAt(0).toUpperCase() + rawDayEN.slice(1).toLowerCase()) : rawDayEN;
  const dayENNoAccent = dayEN ? removeDiacritics(dayEN) : dayEN;

  const dayNumber = date.getDay(); // 0 = Sunday ... 6 = Saturday

  const candidates = [
    dayES,
    dayESNoAccent,
    dayAbbrevES,
    dayAbbrevESNoAccent,
    dayEN,
    dayENNoAccent,
    String(dayNumber),
    String(dayNumber + 1) // some systems use 1-7
  ].filter(Boolean).map(s => String(s).trim().toLowerCase());

  // deduplicate
  return Array.from(new Set(candidates));
};

// Find doctor's schedule with tolerant matching for day and estado
const findDoctorSchedule = async (medicoId, appointmentDate, transaction = null) => {
  const candidates = buildDayCandidates(appointmentDate);

  // If we couldn't build candidates, fallback to searching only by medicoId and ACTIVO
  const dayOrConditions = candidates.length > 0 ? candidates.map(c => Sequelize.where(Sequelize.fn('LOWER', Sequelize.fn('TRIM', Sequelize.col('atr_dia'))), c)) : [];

  const where = {
    atr_id_medico: medicoId,
    [Op.and]: Sequelize.where(Sequelize.fn('LOWER', Sequelize.fn('TRIM', Sequelize.col('atr_estado'))), 'activo')
  };

  if (dayOrConditions.length) where[Op.or] = dayOrConditions;

  const opts = { where };
  if (transaction) opts.transaction = transaction;

  return await MedicoHorario.findOne(opts);
};

module.exports = {
  async createAppointment({ pacienteId, medicoId, fecha, hora, tipoCita, motivo, duracion, userId }) {
    // Verificar que el paciente exista
    const patient = await Patient.findByPk(pacienteId);
    if (!patient) {
      throw new Error('Paciente no encontrado');
    }

    // Verificar que el médico exista
    const doctor = await Doctor.findByPk(medicoId);
    if (!doctor) {
      throw new Error('Médico no encontrado');
    }

    // Verificar que el tipo de cita exista
    const tipoCitaRecord = await TipoCita.findByPk(tipoCita);
    if (!tipoCitaRecord) {
      throw new Error('Tipo de cita no válido');
    }

    // Validar disponibilidad con MedicoHorario
    const appointmentDate = parseLocalDate(fecha);
    const rawDay = appointmentDate.toLocaleDateString('es-ES', { weekday: 'long' });
    const dayOfWeek = rawDay ? (rawDay.charAt(0).toUpperCase() + rawDay.slice(1).toLowerCase()) : rawDay;
    const appointmentTime = hora;

    // Use tolerant lookup helper that matches multiple formats (case, accents, abbrev, english, numeric)
    const doctorSchedule = await findDoctorSchedule(medicoId, appointmentDate);

    if (!doctorSchedule) {
      throw new Error(`El médico no tiene horario disponible para ${dayOfWeek}`);
    }

    // Verificar que la hora de la cita esté dentro del horario del médico
    const [startHour, startMinute] = doctorSchedule.atr_hora_inicio.split(':').map(Number);
    const [endHour, endMinute] = doctorSchedule.atr_hora_fin.split(':').map(Number);
    const [apptHour, apptMinute] = appointmentTime.split(':').map(Number);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    const apptTime = apptHour * 60 + apptMinute;
    const apptEndTime = apptTime + duracion;

    if (apptTime < startTime || apptEndTime > endTime) {
      throw new Error(`La hora de la cita (${appointmentTime}) no está dentro del horario disponible del médico (${doctorSchedule.atr_hora_inicio} - ${doctorSchedule.atr_hora_fin})`);
    }

    // Validar que no haya otra cita del mismo médico en ese rango (conflictos de agenda)
    const estadoCancelada = await EstadoCita.findOne({ where: { atr_nombre_estado: APPOINTMENT_STATUS.CANCELADA } });
    const conflictingAppointment = await Appointment.findOne({
      where: {
        atr_id_medico: medicoId,
        atr_fecha_cita: fecha,
        atr_id_estado: {
          [Op.ne]: estadoCancelada?.atr_id_estado
        }
      },
      include: [{
        model: EstadoCita,
        as: 'EstadoCita'
      }]
    });

    if (conflictingAppointment) {
      const [confHour, confMinute] = conflictingAppointment.atr_hora_cita.split(':').map(Number);
      const confTime = confHour * 60 + confMinute;
      const confEndTime = confTime + (conflictingAppointment.atr_duracion || 60);

      if ((apptTime >= confTime && apptTime < confEndTime) || (apptEndTime > confTime && apptEndTime <= confEndTime) || (apptTime <= confTime && apptEndTime >= confEndTime)) {
        throw new Error('Conflicto de horario: El médico ya tiene una cita programada en este horario');
      }
    }

    // Buscar el ID del estado PROGRAMADA
    const estadoProgramada = await EstadoCita.findOne({
      where: { atr_nombre_estado: APPOINTMENT_STATUS.PROGRAMADA }
    });
    if (!estadoProgramada) {
      throw new Error('Estado PROGRAMADA no encontrado en la base de datos');
    }

    // Crear la cita
    const appointment = await Appointment.create({
      atr_id_paciente: pacienteId,
      atr_id_medico: medicoId,
      atr_fecha_cita: fecha,
      atr_hora_cita: hora,
      atr_id_estado: estadoProgramada.atr_id_estado,
      atr_id_tipo_cita: tipoCita,
      atr_motivo_cita: motivo,
      atr_duracion: duracion,
      atr_id_usuario: userId
    });

    return appointment;
  },

  async create(data) {
    // lógica de solapamiento, disponibilidad
    return Appointment.create(data);
  },
  async listAppointments(filters = {}) {
    const { fechaDesde, fechaHasta, estado, medicoId, pacienteId, limit, offset, sortBy, sortOrder } = filters;

    const where = {};

    if (fechaDesde || fechaHasta) {
      where.atr_fecha_cita = {};
      if (fechaDesde) where.atr_fecha_cita[Op.gte] = fechaDesde;
      if (fechaHasta) where.atr_fecha_cita[Op.lte] = fechaHasta;
    }

    if (estado) {
      where.atr_id_estado = estado;
    }

    if (medicoId) {
      where.atr_id_medico = medicoId;
    }

    if (pacienteId) {
      where.atr_id_paciente = pacienteId;
    }

    const options = {
      where,
      include: [
        { 
          model: Patient, 
          as: 'Patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_identidad']
        },
        { 
          model: Doctor, 
          as: 'Doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido']
        },
        { model: EstadoCita, as: 'EstadoCita' },
        { model: TipoCita, as: 'TipoCita' }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]]
    };

    if (limit) {
      options.limit = limit;
      if (offset) options.offset = offset;
    }

    return Appointment.findAll(options);
  },
  async getById(id) {
    return Appointment.findByPk(id, {
      include: [
        { model: Patient, as: 'Patient' },
        { model: Doctor, as: 'Doctor' },
        { model: User, as: 'User' },
        { model: Recordatorio, as: 'Recordatorios' },
        { model: EstadoCita, as: 'EstadoCita' },
        { model: TipoCita, as: 'TipoCita' }
      ]
    });
  },
  async confirm(id) {
    // Actualizar el estado de la cita a "Confirmada" (asumiendo ID 2)
    return Appointment.update({ atr_id_estado: 2 }, { where: { atr_id_cita: id } });
  },
  async reschedule(id, { nuevaFecha, nuevaHora, motivo, userId, recordatorio }) {
    // Wrap reprogram and optional reminder create/update in a transaction
    await sequelize.transaction(async (t) => {
      const appointment = await Appointment.findByPk(id, {
        include: [ { model: EstadoCita, as: 'EstadoCita' } ],
        transaction: t
      });

      if (!appointment) {
        throw new Error('Cita no encontrada');
      }

      // Verificar que no esté en estado final
      const currentStatus = appointment.EstadoCita?.atr_nombre_estado;
      const finalStatuses = [APPOINTMENT_STATUS.FINALIZADA, APPOINTMENT_STATUS.CANCELADA, APPOINTMENT_STATUS.NO_ASISTIO];
      if (finalStatuses.includes(currentStatus)) {
        throw new Error(`No se puede reprogramar una cita en estado ${currentStatus}`);
      }

      // Validar disponibilidad con MedicoHorario
      const appointmentDate = parseLocalDate(nuevaFecha);
      const rawDay = appointmentDate.toLocaleDateString('es-ES', { weekday: 'long' });
      const dayOfWeek = rawDay ? (rawDay.charAt(0).toUpperCase() + rawDay.slice(1).toLowerCase()) : rawDay;
      const dayOfWeekNoAccent = dayOfWeek ? removeDiacritics(dayOfWeek) : dayOfWeek;
      const appointmentTime = nuevaHora;

      const doctorSchedule = await findDoctorSchedule(appointment.atr_id_medico, appointmentDate, t);

      if (!doctorSchedule) {
        throw new Error(`El médico no tiene horario disponible para ${dayOfWeek}`);
      }

      // Verificar que la hora de la cita esté dentro del horario del médico
      const [startHour, startMinute] = doctorSchedule.atr_hora_inicio.split(':').map(Number);
      const [endHour, endMinute] = doctorSchedule.atr_hora_fin.split(':').map(Number);
      const [apptHour, apptMinute] = appointmentTime.split(':').map(Number);

      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      const apptTime = apptHour * 60 + apptMinute;
      const apptEndTime = apptTime + (appointment.atr_duracion || 60);

      if (apptTime < startTime || apptEndTime > endTime) {
        throw new Error(`La nueva hora (${appointmentTime}) no está dentro del horario disponible del médico (${doctorSchedule.atr_hora_inicio} - ${doctorSchedule.atr_hora_fin})`);
      }

      // Validar que no haya otra cita del mismo médico en ese rango
      const estadoCancelada = await EstadoCita.findOne({ where: { atr_nombre_estado: APPOINTMENT_STATUS.CANCELADA }, transaction: t });
      const conflictingAppointment = await Appointment.findOne({
        where: {
          atr_id_medico: appointment.atr_id_medico,
          atr_fecha_cita: nuevaFecha,
          atr_id_estado: { [Op.ne]: estadoCancelada?.atr_id_estado },
          atr_id_cita: { [Op.ne]: id }
        },
        include: [{ model: EstadoCita, as: 'EstadoCita' }],
        transaction: t
      });

      if (conflictingAppointment) {
        const [confHour, confMinute] = conflictingAppointment.atr_hora_cita.split(':').map(Number);
        const confTime = confHour * 60 + confMinute;
        const confEndTime = confTime + (conflictingAppointment.atr_duracion || 60);

        if ((apptTime >= confTime && apptTime < confEndTime) || (apptEndTime > confTime && apptEndTime <= confEndTime) || (apptTime <= confTime && apptEndTime >= confEndTime)) {
          throw new Error('Conflicto de horario: El médico ya tiene una cita programada en este horario');
        }
      }

      // Crear registro en ReprogramarCita
      await ReprogramarCita.create({
        atr_id_cita: id,
        atr_fecha_anterior: appointment.atr_fecha_cita,
        atr_hora_anterior: appointment.atr_hora_cita,
        atr_nueva_fecha: nuevaFecha,
        atr_nueva_hora: nuevaHora,
        atr_motivo_reprogramacion: motivo,
        atr_estado_reprogramacion: 'APROBADA',
        atr_id_usuario: userId
      }, { transaction: t });

      // Actualizar Appointment
      await appointment.update({ atr_fecha_cita: nuevaFecha, atr_hora_cita: nuevaHora }, { transaction: t });

      // Si se incluye recordatorio en el payload, crear o actualizar
      if (recordatorio) {
        const r = recordatorio;
        let rec = await Recordatorio.findOne({ where: { atr_id_cita: id }, transaction: t });
        if (rec) {
          await rec.update({
            atr_fecha_hora_envio: r.fechaHoraEnvio || rec.atr_fecha_hora_envio,
            atr_medio: r.medio || rec.atr_medio,
            atr_contenido: r.contenido || rec.atr_contenido
          }, { transaction: t });
        } else {
          rec = await Recordatorio.create({
            atr_id_cita: id,
            atr_fecha_hora_envio: r.fechaHoraEnvio,
            atr_medio: r.medio,
            atr_contenido: r.contenido || `Recordatorio por reprogramación`
          }, { transaction: t });
        }

        // Registrar estado inicial en la bitácora del recordatorio
        await registrarEstadoRecordatorio(rec.atr_id_recordatorio, r.estado || ESTADOS_RECORDATORIO.PENDIENTE, 'Creado/ajustado al reprogramar', false, { transaction: t });
      }
    });

    // Obtener la cita actualizada con relaciones
    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        { model: Patient, as: 'Patient' },
        { model: Doctor, as: 'Doctor' },
        { model: User, as: 'User' },
        { model: Recordatorio, as: 'Recordatorios' },
        { model: EstadoCita, as: 'EstadoCita' },
        { model: TipoCita, as: 'TipoCita' },
        { model: ReprogramarCita, as: 'Reprogramaciones' }
      ]
    });

    return updatedAppointment;
  },
  async cancel(id, reason) {
    // Actualizar el estado de la cita a "Cancelada" (asumiendo ID 3)
    return Appointment.update({ atr_id_estado: 3 }, { where: { atr_id_cita: id } });
  },
  async getCalendarAppointments(start, end) {
    const appointments = await Appointment.findAll({
      where: {
        atr_fecha_cita: {
          [Op.gte]: start,
          [Op.lte]: end
        }
      },
      include: [
        { 
          model: Patient, 
          as: 'Patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido']
        },
        { 
          model: Doctor, 
          as: 'Doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido']
        },
        { model: EstadoCita, as: 'EstadoCita' },
        { model: TipoCita, as: 'TipoCita' }
      ],
      order: [['atr_fecha_cita', 'ASC'], ['atr_hora_cita', 'ASC']]
    });

    return appointments.map(a => ({
      id: a.atr_id_cita,
      title: `${a.Patient.atr_nombre} ${a.Patient.atr_apellido} - ${a.TipoCita.atr_nombre_tipo_cita}`,
      start: `${a.atr_fecha_cita}T${a.atr_hora_cita}:00`,
      extendedProps: {
        estado: a.EstadoCita.atr_nombre_estado,
        pacienteId: a.atr_id_paciente,
        medicoId: a.atr_id_medico
      }
    }));
  },

  async updateAppointment(id, updateData) {
    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: EstadoCita, as: 'EstadoCita' },
        { model: TipoCita, as: 'TipoCita' }
      ]
    });

    if (!appointment) {
      throw new Error('Cita no encontrada');
    }

    // Preparar datos para actualización
    const dataToUpdate = {};

    if (updateData.fecha) dataToUpdate.atr_fecha_cita = updateData.fecha;
    if (updateData.hora) dataToUpdate.atr_hora_cita = updateData.hora;
    if (updateData.tipoCita) {
      const tipoCitaRecord = await TipoCita.findByPk(updateData.tipoCita);
      if (!tipoCitaRecord) {
        throw new Error('Tipo de cita no válido');
      }
      dataToUpdate.atr_id_tipo_cita = updateData.tipoCita;
    }
    if (updateData.motivo) dataToUpdate.atr_motivo_cita = updateData.motivo;
    if (updateData.duracion) dataToUpdate.atr_duracion = updateData.duracion;

    // Si se cambia fecha, hora o médico, revalidar disponibilidad
    const fecha = dataToUpdate.atr_fecha_cita || appointment.atr_fecha_cita;
    const hora = dataToUpdate.atr_hora_cita || appointment.atr_hora_cita;
    const medicoId = appointment.atr_id_medico; // Asumiendo que médico no cambia en update
    const duracion = dataToUpdate.atr_duracion || appointment.atr_duracion;

    if (dataToUpdate.atr_fecha_cita || dataToUpdate.atr_hora_cita || dataToUpdate.atr_duracion) {
      // Revalidar disponibilidad
      const appointmentDate = parseLocalDate(fecha);
      const rawDay = appointmentDate.toLocaleDateString('es-ES', { weekday: 'long' });
      const dayOfWeek = rawDay ? (rawDay.charAt(0).toUpperCase() + rawDay.slice(1).toLowerCase()) : rawDay;
      const dayOfWeekNoAccent = dayOfWeek ? removeDiacritics(dayOfWeek) : dayOfWeek;
      const appointmentTime = hora;

      const doctorSchedule = await findDoctorSchedule(medicoId, appointmentDate);

      if (!doctorSchedule) {
        throw new Error(`El médico no tiene horario disponible para ${dayOfWeek}`);
      }

      // Verificar que la hora de la cita esté dentro del horario del médico
      const [startHour, startMinute] = doctorSchedule.atr_hora_inicio.split(':').map(Number);
      const [endHour, endMinute] = doctorSchedule.atr_hora_fin.split(':').map(Number);
      const [apptHour, apptMinute] = appointmentTime.split(':').map(Number);

      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      const apptTime = apptHour * 60 + apptMinute;
      const apptEndTime = apptTime + duracion;

      if (apptTime < startTime || apptEndTime > endTime) {
        throw new Error(`La hora de la cita (${appointmentTime}) no está dentro del horario disponible del médico (${doctorSchedule.atr_hora_inicio} - ${doctorSchedule.atr_hora_fin})`);
      }

      // Validar que no haya otra cita del mismo médico en ese rango (excluyendo la actual)
      const estadoCancelada = await EstadoCita.findOne({ where: { atr_nombre_estado: APPOINTMENT_STATUS.CANCELADA } });
      const conflictingAppointment = await Appointment.findOne({
        where: {
          atr_id_medico: medicoId,
          atr_fecha_cita: fecha,
          atr_id_estado: {
            [Op.ne]: estadoCancelada?.atr_id_estado
          },
          atr_id_cita: {
            [Op.ne]: id // Excluir la cita actual
          }
        },
        include: [{
          model: EstadoCita,
          as: 'EstadoCita'
        }]
      });

      if (conflictingAppointment) {
        const [confHour, confMinute] = conflictingAppointment.atr_hora_cita.split(':').map(Number);
        const confTime = confHour * 60 + confMinute;
        const confEndTime = confTime + (conflictingAppointment.atr_duracion || 60);

        if ((apptTime >= confTime && apptTime < confEndTime) || (apptEndTime > confTime && apptEndTime <= confEndTime) || (apptTime <= confTime && apptEndTime >= confEndTime)) {
          throw new Error('Conflicto de horario: El médico ya tiene una cita programada en este horario');
        }
      }
    }

    // Actualizar la cita
    await appointment.update(dataToUpdate);

    // Obtener la cita actualizada con relaciones
    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        { model: Patient, as: 'Patient' },
        { model: Doctor, as: 'Doctor' },
        { model: User, as: 'User' },
        { model: Recordatorio, as: 'Recordatorios' },
        { model: EstadoCita, as: 'EstadoCita' },
        { model: TipoCita, as: 'TipoCita' }
      ]
    });

    return updatedAppointment;
  },

  async updateStatus(id, statusName) {
    const estado = await EstadoCita.findOne({ where: { atr_nombre_estado: statusName } });
    if (!estado) {
      throw new Error(`Estado ${statusName} no encontrado`);
    }
    return Appointment.update({ atr_id_estado: estado.atr_id_estado }, { where: { atr_id_cita: id } });
  },

  async getPendingPayments(filters = {}) {
    const where = { atr_id_estado: CITA_ESTADOS.PENDIENTE_PAGO };

    if (filters.fecha) {
      where.atr_fecha_cita = filters.fecha;
    }

    if (filters.medicoId) {
      where.atr_id_medico = filters.medicoId;
    }

    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: Patient, as: 'Patient' },
        { model: Doctor, as: 'Doctor' },
        { model: TipoCita, as: 'TipoCita' }
      ],
      order: [['atr_fecha_cita', 'ASC'], ['atr_hora_cita', 'ASC']],
    });

    // Mapear la respuesta para incluir campos calculados que espera el frontend
    return appointments.map(appointment => ({
      atr_id_cita: appointment.atr_id_cita,
      atr_fecha_cita: appointment.atr_fecha_cita,
      atr_hora_cita: appointment.atr_hora_cita,
      atr_motivo_cita: appointment.atr_motivo_cita,
      paciente: {
        nombreCompleto: `${appointment.Patient.atr_nombre} ${appointment.Patient.atr_apellido}`
      },
      medico: {
        nombreCompleto: `${appointment.Doctor.atr_nombre} ${appointment.Doctor.atr_apellido}`
      },
      tipoCitaDescripcion: appointment.TipoCita?.atr_nombre_tipo_cita || 'N/A'
    }));
  },

  async payAppointment(appointmentId, usuarioCajaId, datosPago = {}) {
    return sequelize.transaction(async (t) => {
      const cita = await Appointment.findByPk(appointmentId, { transaction: t });

      if (!cita) {
        const error = new Error('Cita no encontrada');
        error.statusCode = 404;
        throw error;
      }

      if (cita.atr_id_estado !== CITA_ESTADOS.PENDIENTE_PAGO) {
        const error = new Error('La cita no está en estado PENDIENTE_PAGO');
        error.statusCode = 400;
        throw error;
      }

      // OPCIONAL: registrar un pago mínimo (sin control contable completo)
      // if (datosPago) {
      //   await PagoCita.create({
      //     atr_id_cita: appointmentId,
      //     atr_forma_pago: datosPago.formaPago || null,
      //     atr_referencia: datosPago.referencia || null,
      //     atr_observacion: datosPago.observacion || null,
      //   }, { transaction: t });
      // }

      // Cambiar estado a FINALIZADA
      cita.atr_id_estado = CITA_ESTADOS.FINALIZADA;
      await cita.save({ transaction: t });

      // Registrar en bitácora
      await bitacoraService.registrarEvento({
        atr_id_usuario: usuarioCajaId,
        atr_id_objetos: appointmentId,
        atr_accion: 'PAGAR_CITA',
        atr_descripcion: `Cita ${appointmentId} marcada como FINALIZADA (Pago Caja)`,
        ip_origen: null // Se puede pasar desde el controlador si está disponible
      });

      return cita;
    });
  }
};
