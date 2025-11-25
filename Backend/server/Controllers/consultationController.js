const { Consultation, Recordatorio, Appointment, OrdenExamen, OrdenExamenDetalle, Receta, Medicamento, Treatment, Patient, Doctor, EstadoCita, Examen, TreatmentProcedure, TreatmentProcedureProduct, Producto } = require('../Models');
const { getEstadoIdByNombre, CITA_ESTADOS } = require('../Config/statusCodes');
const logger = require('../utils/logger');
const ResponseService = require('../services/responseService');
const appointmentService = require('../services/appointmentService');
const { registrarEventoBitacora } = require('./BitacoraController');

exports.list = async (req, res) => {
  try {
    const { patientId } = req.query;
    let where = {};
    if (patientId) {
      where.atr_id_paciente = patientId;
    }
    const consultations = await Consultation.findAll({
      where,
      order: [['atr_fecha_consulta', 'DESC']],
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' }
      ]
    });
    return ResponseService.success(res, consultations);
  } catch (error) {
    logger.error('Error listando consultas:', error);
    return ResponseService.internalError(res, 'Error al obtener consultas');
  }
};

exports.getByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Validar que la cita existe
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: Patient, as: 'Patient' },
        { model: Doctor, as: 'Doctor' }
      ]
    });

    if (!appointment) {
      return ResponseService.notFound(res, 'Cita no encontrada');
    }

    // Buscar consulta asociada con includes
    const consultation = await Consultation.findOne({
      where: { atr_id_cita: appointmentId },
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: OrdenExamen, as: 'ordenesExamen', include: [
          { model: OrdenExamenDetalle, as: 'detalles' }
        ]},
        { model: Receta, as: 'recetas', include: [
          { model: Medicamento, as: 'medicamentos' }
        ]},
        { model: Treatment, as: 'tratamientos' }
      ]
    });

    if (!consultation) {
      // No existe consulta, devolver datos para nueva consulta
      return ResponseService.success(res, {
        exists: false,
        appointment: {
          atr_id_cita: appointment.atr_id_cita,
          atr_fecha_hora: appointment.atr_fecha_hora,
          atr_motivo: appointment.atr_motivo,
          atr_observaciones: appointment.atr_observaciones
        },
        patient: appointment.Patient,
        doctor: appointment.Doctor
      });
    }

    // Existe consulta, devolver con datos completos
    return ResponseService.success(res, {
      exists: true,
      consultation
    });

  } catch (error) {
    logger.error('Error obteniendo consulta por cita:', error);
    return ResponseService.internalError(res, 'Error al obtener la consulta');
  }
};

exports.get = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: OrdenExamen, as: 'ordenesExamen', include: [
          { model: OrdenExamenDetalle, as: 'detalles' }
        ]},
        { model: Receta, as: 'recetas', include: [
          { model: Medicamento, as: 'medicamentos' }
        ]},
        { model: Treatment, as: 'tratamientos' }
      ]
    });
    if (!consultation) {
      return ResponseService.notFound(res, 'Consulta no encontrada');
    }
    return ResponseService.success(res, consultation);
  } catch (error) {
    logger.error('Error obteniendo consulta:', error);
    return ResponseService.internalError(res, 'Error al obtener la consulta');
  }
};

exports.create = async (req, res) => {
  try {
    const {
      appointmentId,
      pacienteId,
      medicoId,
      sintomas,
      diagnostico,
      observaciones,
      peso,
      altura,
      temperatura,
      seguimiento = false,
      sigVisitDia
    } = req.body;

    // Validar campos requeridos
    if (!appointmentId || !pacienteId || !medicoId) {
      return ResponseService.badRequest(res, 'appointmentId, pacienteId y medicoId son requeridos');
    }

    // Validar que la cita existe
    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: EstadoCita, as: 'EstadoCita' }
      ]
    });

    if (!appointment) {
      return ResponseService.notFound(res, 'Cita no encontrada');
    }

    // Validar estado de la cita (debe estar PROGRAMADA, CONFIRMADA o EN_CONSULTA)
    const estadosValidos = [CITA_ESTADOS.PROGRAMADA, CITA_ESTADOS.CONFIRMADA, CITA_ESTADOS.EN_CONSULTA];
    if (!estadosValidos.includes(appointment.atr_id_estado)) {
      return ResponseService.badRequest(res, 'La cita debe estar en estado PROGRAMADA, CONFIRMADA o EN_CONSULTA para crear una consulta');
    }

    // Validar que paciente y médico coincidan con la cita
    if (appointment.atr_id_paciente !== pacienteId) {
      return ResponseService.badRequest(res, 'El paciente no coincide con la cita');
    }

    if (appointment.atr_id_medico !== medicoId) {
      return ResponseService.badRequest(res, 'El médico no coincide con la cita');
    }

    // Verificar que no exista ya una consulta para esta cita
    const existingConsultation = await Consultation.findOne({ where: { atr_id_cita: appointmentId } });
    if (existingConsultation) {
      return ResponseService.badRequest(res, 'Ya existe una consulta para esta cita');
    }

    // Preparar datos para crear la consulta
    const consultationData = {
      atr_id_cita: appointmentId,
      atr_id_paciente: pacienteId,
      atr_id_medico: medicoId,
      atr_fecha_consulta: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
      atr_sintomas_paciente: sintomas,
      atr_diagnostico: diagnostico,
      atr_observaciones: observaciones,
      atr_peso: peso,
      atr_altura: altura,
      atr_temperatura: temperatura,
      atr_seguimiento: seguimiento,
      atr_sig_visit_dia: sigVisitDia,
      atr_creado_por: req.user?.atr_id_usuario || 1, // Usuario autenticado o default
      atr_fecha_creacion: new Date(),
      atr_fecha_actualizacion: new Date()
    };

    // Crear la consulta
    const created = await Consultation.create(consultationData);

    // Actualizar estado de la cita a EN_CONSULTA si no lo está ya
    let estadoCambiado = false;
    if (appointment.atr_id_estado !== CITA_ESTADOS.EN_CONSULTA) {
      await appointment.update({ atr_id_estado: CITA_ESTADOS.EN_CONSULTA });
      estadoCambiado = true;
    }

    // Registrar en bitácora: creación de consulta
    try {
      await registrarEventoBitacora(
        'CREAR_CONSULTA',
        `Consulta médica creada para cita #${appointmentId} - Paciente ID: ${pacienteId}`,
        req.user?.atr_id_usuario || 1,
        created.atr_id_consulta,
        req.ip || req.connection.remoteAddress
      );

      // Registrar cambio de estado si ocurrió
      if (estadoCambiado) {
        await registrarEventoBitacora(
          'CAMBIAR_ESTADO_CITA',
          `Cita #${appointmentId} cambió de estado a EN_CONSULTA por creación de consulta`,
          req.user?.atr_id_usuario || 1,
          appointmentId,
          req.ip || req.connection.remoteAddress
        );
      }
    } catch (bitacoraError) {
      logger.error('Error registrando en bitácora:', bitacoraError);
      // No fallar la creación por error en bitácora
    }

    // Si se requiere seguimiento, crear recordatorio
    if (seguimiento || sigVisitDia) {
      try {
        await Recordatorio.create({
          atr_id_cita: appointmentId,
          atr_fecha_hora_envio: sigVisitDia ? new Date(sigVisitDia) : new Date(),
          atr_medio: 'notificación app',
          atr_contenido: `Recordatorio: seguimiento para consulta #${created.atr_id_consulta}`,
          atr_id_estado_recordatorio: 1,
          atr_cancelacion: false
        });
      } catch (e) {
        logger.error('Error creando recordatorio para consulta:', e);
        // No fallar la creación de la consulta por error en recordatorio
      }
    }

    // Opcional: Crear registro en historial médico (si existiera la tabla)
    // TODO: Implementar cuando se cree el modelo HistorialMedico

    // Retornar la consulta creada con includes
    const consultationWithIncludes = await Consultation.findByPk(created.atr_id_consulta, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Appointment, as: 'appointment' }
      ]
    });

    return ResponseService.created(res, consultationWithIncludes);

  } catch (error) {
    logger.error('Error creando consulta:', error);
    return ResponseService.internalError(res, 'Error al crear la consulta');
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sintomas,
      diagnostico,
      observaciones,
      peso,
      altura,
      temperatura,
      seguimiento,
      sigVisitDia
    } = req.body;

    // Buscar la consulta con la cita asociada
    const consultation = await Consultation.findByPk(id, {
      include: [
        {
          model: Appointment,
          as: 'appointment',
          include: [{ model: EstadoCita, as: 'EstadoCita' }]
        }
      ]
    });

    if (!consultation) {
      return ResponseService.notFound(res, 'Consulta no encontrada');
    }

    // Validar que la cita asociada no esté en estado FINALIZADA
    if (consultation.appointment && consultation.appointment.atr_id_estado === CITA_ESTADOS.FINALIZADA) {
      return ResponseService.badRequest(res, 'No se puede actualizar una consulta con cita finalizada');
    }

    // Preparar datos para actualizar (solo campos permitidos)
    const updateData = {
      atr_fecha_actualizacion: new Date()
    };

    // Campos clínicos permitidos para actualización
    if (sintomas !== undefined) updateData.atr_sintomas_paciente = sintomas;
    if (diagnostico !== undefined) updateData.atr_diagnostico = diagnostico;
    if (observaciones !== undefined) updateData.atr_observaciones = observaciones;
    if (peso !== undefined) updateData.atr_peso = peso;
    if (altura !== undefined) updateData.atr_altura = altura;
    if (temperatura !== undefined) updateData.atr_temperatura = temperatura;
    if (seguimiento !== undefined) updateData.atr_seguimiento = seguimiento;
    if (sigVisitDia !== undefined) updateData.atr_sig_visit_dia = sigVisitDia;

    // Actualizar la consulta
    await consultation.update(updateData);

    // Registrar en bitácora: actualización de consulta
    try {
      const cambios = Object.keys(updateData).filter(key => key !== 'atr_fecha_actualizacion').join(', ');
      await registrarEventoBitacora(
        'ACTUALIZAR_CONSULTA',
        `Consulta #${id} actualizada - Campos modificados: ${cambios}`,
        req.user?.atr_id_usuario || 1,
        id,
        req.ip || req.connection.remoteAddress
      );
    } catch (bitacoraError) {
      logger.error('Error registrando actualización en bitácora:', bitacoraError);
      // No fallar la actualización por error en bitácora
    }

    // Si se solicita seguimiento, crear recordatorio
    if (seguimiento || sigVisitDia) {
      try {
        await Recordatorio.create({
          atr_id_cita: consultation.atr_id_cita,
          atr_fecha_hora_envio: sigVisitDia ? new Date(sigVisitDia) : new Date(),
          atr_medio: 'notificación app',
          atr_contenido: `Recordatorio: seguimiento para consulta #${consultation.atr_id_consulta}`,
          atr_id_estado_recordatorio: 1,
          atr_cancelacion: false
        });
      } catch (e) {
        logger.error('Error creando recordatorio al actualizar consulta:', e);
        // No fallar la actualización por error en recordatorio
      }
    }

    // Retornar la consulta actualizada con includes
    const updatedConsultation = await Consultation.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' },
        { model: Appointment, as: 'appointment' }
      ]
    });

    return ResponseService.success(res, updatedConsultation);

  } catch (error) {
    logger.error('Error actualizando consulta:', error);
    return ResponseService.internalError(res, 'Error al actualizar la consulta');
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findByPk(id);
    if (!consultation) return ResponseService.notFound(res, 'Consulta no encontrada');

    await consultation.destroy();
    return ResponseService.success(res, { message: 'Consulta eliminada' });
  } catch (error) {
    logger.error('Error eliminando consulta:', error);
    return ResponseService.internalError(res, 'Error al eliminar la consulta');
  }
};

exports.finalize = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findByPk(id, {
      include: [{ model: Appointment, as: 'Appointment' }]
    });
    if (!consultation) return ResponseService.notFound(res, 'Consulta no encontrada');

    // Update consultation with final data
    const data = req.body;
    await consultation.update(data);

    // Change appointment status to PENDIENTE_PAGO
    if (consultation.atr_id_cita) {
      const appointment = await Appointment.findByPk(consultation.atr_id_cita);
      if (appointment) {
        const pendientePagoId = getEstadoIdByNombre('PENDIENTE_PAGO');
        await appointment.update({ atr_id_estado: pendientePagoId });
      }
    }

    return ResponseService.success(res, consultation);
  } catch (error) {
    logger.error('Error finalizando consulta:', error);
    return ResponseService.internalError(res, 'Error al finalizar la consulta');
  }
};

exports.finishConsultation = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar la consulta por id e incluir la cita (Appointment)
    const consulta = await Consultation.findByPk(id, {
      include: [{ model: Appointment, as: 'appointment' }]
    });

    // Validar que la consulta exista
    if (!consulta) {
      return ResponseService.notFound(res, 'Consulta no encontrada');
    }

    // Validar que la cita esté en estado EN_CONSULTA
    if (consulta.appointment.atr_id_estado !== CITA_ESTADOS.EN_CONSULTA) {
      return ResponseService.badRequest(res, 'La cita no está en estado EN_CONSULTA');
    }

    // (Opcional) Crear/actualizar entrada en tbl_historial_medico con la info final de la consulta
    // TODO: Implementar cuando se cree el modelo HistorialMedico

    // Llamar a appointmentService.updateStatus(appointmentId, 'PENDIENTE_PAGO')
    await appointmentService.updateStatus(consulta.appointment.atr_id_cita, 'PENDIENTE_PAGO');

    // Registrar en bitácora: finalización de consulta y cambio de estado
    try {
      await registrarEventoBitacora(
        'FINALIZAR_CONSULTA',
        `Consulta #${id} finalizada - Cita cambió a estado PENDIENTE_PAGO`,
        req.user?.atr_id_usuario || 1,
        id,
        req.ip || req.connection.remoteAddress
      );

      await registrarEventoBitacora(
        'CAMBIAR_ESTADO_CITA',
        `Cita #${consulta.appointment.atr_id_cita} cambió a estado PENDIENTE_PAGO por finalización de consulta`,
        req.user?.atr_id_usuario || 1,
        consulta.appointment.atr_id_cita,
        req.ip || req.connection.remoteAddress
      );
    } catch (bitacoraError) {
      logger.error('Error registrando finalización en bitácora:', bitacoraError);
      // No fallar la finalización por error en bitácora
    }

    // Devolver respuesta
    return ResponseService.success(res, {
      message: "Consulta finalizada, cita en estado PENDIENTE_PAGO",
      consulta,
      cita: consulta.appointment
    });

  } catch (error) {
    logger.error('Error finalizando consulta:', error);
    return ResponseService.internalError(res, 'Error al finalizar la consulta');
  }
};

// Órdenes de examen para una consulta
exports.createExamOrder = async (req, res) => {
  try {
    const { id: consultationId } = req.params;
    const { exams } = req.body;

    // Validar que la consulta existe
    const consultation = await Consultation.findByPk(consultationId, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' }
      ]
    });

    if (!consultation) {
      return ResponseService.notFound(res, 'Consulta no encontrada');
    }

    // Validar que exams es un array y no está vacío
    if (!Array.isArray(exams) || exams.length === 0) {
      return ResponseService.badRequest(res, 'Debe proporcionar al menos un examen');
    }

    // Crear la orden de examen
    const examOrder = await OrdenExamen.create({
      atr_id_paciente: consultation.atr_id_paciente,
      atr_id_medico: consultation.atr_id_medico,
      atr_id_consulta: consultationId,
      atr_fecha_solicitud: new Date(),
      atr_resultados_disponibles: false
    });

    // Crear los detalles de examen
    const examDetails = [];
    for (const exam of exams) {
      // Buscar o crear el examen en la tabla tbl_examen
      let examRecord = await Examen.findOne({
        where: { atr_nombre_examen: exam.nombre }
      });

      if (!examRecord) {
        // Si no existe, crear un nuevo examen
        examRecord = await Examen.create({
          atr_nombre_examen: exam.nombre,
          atr_descripcion: exam.observacion || '',
          atr_tipo_examen: 'laboratorio' // default
        });
      }

      // Crear el detalle de la orden
      const detail = await OrdenExamenDetalle.create({
        atr_id_orden_exa: examOrder.atr_id_orden_exa,
        atr_id_examen: examRecord.atr_id_examen,
        atr_observacion: exam.observacion || '',
        atr_id_consulta: consultationId
      });

      examDetails.push({
        ...detail.toJSON(),
        examen: examRecord
      });
    }

    // Retornar la orden con sus detalles
    const orderWithDetails = {
      ...examOrder.toJSON(),
      detalles: examDetails
    };

    // Registrar en bitácora: creación de orden de examen
    try {
      await registrarEventoBitacora(
        'CREAR_ORDEN_EXAMEN',
        `Orden de examen #${examOrder.atr_id_orden_exa} creada para consulta #${consultationId} - ${exams.length} exámenes`,
        req.user?.atr_id_usuario || 1,
        examOrder.atr_id_orden_exa,
        req.ip || req.connection.remoteAddress
      );
    } catch (bitacoraError) {
      logger.error('Error registrando orden de examen en bitácora:', bitacoraError);
      // No fallar la creación por error en bitácora
    }

    return ResponseService.created(res, orderWithDetails);

  } catch (error) {
    logger.error('Error creando orden de examen:', error);
    return ResponseService.internalError(res, 'Error al crear la orden de examen');
  }
};

exports.getExamOrders = async (req, res) => {
  try {
    const { id: consultationId } = req.params;

    // Validar que la consulta existe
    const consultation = await Consultation.findByPk(consultationId);
    if (!consultation) {
      return ResponseService.notFound(res, 'Consulta no encontrada');
    }

    // Obtener todas las órdenes de examen para esta consulta
    const examOrders = await OrdenExamen.findAll({
      where: { atr_id_consulta: consultationId },
      include: [
        {
          model: OrdenExamenDetalle,
          as: 'detalles',
          include: [
            {
              model: Examen,
              as: 'examen'
            }
          ]
        }
      ],
      order: [['atr_fecha_solicitud', 'DESC']]
    });

    return ResponseService.success(res, examOrders);

  } catch (error) {
    logger.error('Error obteniendo órdenes de examen:', error);
    return ResponseService.internalError(res, 'Error al obtener las órdenes de examen');
  }
};

// Recetas médicas para una consulta
exports.createPrescription = async (req, res) => {
  try {
    const { id: consultationId } = req.params;
    const { medicamentos } = req.body;

    // Validar que la consulta existe
    const consultation = await Consultation.findByPk(consultationId, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' }
      ]
    });

    if (!consultation) {
      return ResponseService.notFound(res, 'Consulta no encontrada');
    }

    // Validar que medicamentos es un array y no está vacío
    if (!Array.isArray(medicamentos) || medicamentos.length === 0) {
      return ResponseService.badRequest(res, 'Debe proporcionar al menos un medicamento');
    }

    // Crear la receta
    const prescription = await Receta.create({
      atr_id_consulta: consultationId,
      atr_id_paciente: consultation.atr_id_paciente,
      atr_id_medico: consultation.atr_id_medico,
      atr_fecha_receta: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
      atr_estado_receta: 'PENDIENTE_ENTREGA'
    });

    // Crear los medicamentos de la receta
    const prescriptionMedicines = [];
    for (const med of medicamentos) {
      // Aquí asumimos que medicamentoId se refiere a un ID de medicamento existente
      // Si no existe, podríamos crear un registro básico, pero por ahora esperamos que exista
      let medicineName = `Medicamento ${med.medicamentoId}`; // fallback

      // Si queremos buscar el nombre del medicamento base, podríamos hacer una consulta
      // Pero por simplicidad, usaremos el ID como nombre o asumiremos que viene en el request

      if (med.nombre) {
        medicineName = med.nombre;
      }

      const medicine = await Medicamento.create({
        atr_id_medicamento_base: med.medicamentoId,
        atr_nombre_medicamento: medicineName,
        atr_dosis: med.dosis,
        atr_frecuencia: med.frecuencia || '',
        atr_duracion: med.duracion,
        atr_id_receta: prescription.atr_id_receta
      });

      prescriptionMedicines.push(medicine);
    }

    // Retornar la receta con sus medicamentos
    const prescriptionWithMedicines = {
      ...prescription.toJSON(),
      medicamentos: prescriptionMedicines
    };

    // Registrar en bitácora: creación de receta
    try {
      await registrarEventoBitacora(
        'CREAR_RECETA',
        `Receta #${prescription.atr_id_receta} creada para consulta #${consultationId} - ${medicamentos.length} medicamentos`,
        req.user?.atr_id_usuario || 1,
        prescription.atr_id_receta,
        req.ip || req.connection.remoteAddress
      );
    } catch (bitacoraError) {
      logger.error('Error registrando receta en bitácora:', bitacoraError);
      // No fallar la creación por error en bitácora
    }

    return ResponseService.created(res, prescriptionWithMedicines);

  } catch (error) {
    logger.error('Error creando receta:', error);
    return ResponseService.internalError(res, 'Error al crear la receta');
  }
};

exports.getPrescriptions = async (req, res) => {
  try {
    const { id: consultationId } = req.params;

    // Validar que la consulta existe
    const consultation = await Consultation.findByPk(consultationId);
    if (!consultation) {
      return ResponseService.notFound(res, 'Consulta no encontrada');
    }

    // Obtener todas las recetas para esta consulta
    const prescriptions = await Receta.findAll({
      where: { atr_id_consulta: consultationId },
      include: [
        {
          model: Medicamento,
          as: 'medicamentos'
        }
      ],
      order: [['atr_fecha_receta', 'DESC']]
    });

    return ResponseService.success(res, prescriptions);

  } catch (error) {
    logger.error('Error obteniendo recetas:', error);
    return ResponseService.internalError(res, 'Error al obtener las recetas');
  }
};

exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar estado
    const estadosValidos = ['PENDIENTE_ENTREGA', 'ENTREGADA', 'CANCELADA'];
    if (!estadosValidos.includes(estado)) {
      return ResponseService.badRequest(res, 'Estado inválido. Debe ser PENDIENTE_ENTREGA, ENTREGADA o CANCELADA');
    }

    // Buscar la receta
    const prescription = await Receta.findByPk(id);
    if (!prescription) {
      return ResponseService.notFound(res, 'Receta no encontrada');
    }

    // Actualizar estado
    await prescription.update({ atr_estado_receta: estado });

    // Registrar en bitácora: actualización de estado de receta
    try {
      await registrarEventoBitacora(
        'ACTUALIZAR_ESTADO_RECETA',
        `Estado de receta #${id} cambiado a ${estado}`,
        req.user?.atr_id_usuario || 1,
        id,
        req.ip || req.connection.remoteAddress
      );
    } catch (bitacoraError) {
      logger.error('Error registrando actualización de receta en bitácora:', bitacoraError);
      // No fallar la actualización por error en bitácora
    }

    // Obtener la receta actualizada con medicamentos
    const updatedPrescription = await Receta.findByPk(id, {
      include: [
        {
          model: Medicamento,
          as: 'medicamentos'
        }
      ]
    });

    return ResponseService.success(res, updatedPrescription);

  } catch (error) {
    logger.error('Error actualizando estado de receta:', error);
    return ResponseService.internalError(res, 'Error al actualizar el estado de la receta');
  }
};

// Tratamientos para una consulta
exports.createTreatments = async (req, res) => {
  try {
    const { id: consultationId } = req.params;
    const { tratamientos } = req.body;

    // Validar que la consulta existe
    const consultation = await Consultation.findByPk(consultationId, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' }
      ]
    });

    if (!consultation) {
      return ResponseService.notFound(res, 'Consulta no encontrada');
    }

    // Validar que tratamientos es un array y no está vacío
    if (!Array.isArray(tratamientos) || tratamientos.length === 0) {
      return ResponseService.badRequest(res, 'Debe proporcionar al menos un tratamiento');
    }

    const createdTreatments = [];

    // Crear tratamientos y sus procedimientos
    for (const trat of tratamientos) {
      // Validar que el producto existe si se proporciona
      let producto = null;
      if (trat.productoId) {
        producto = await Producto.findByPk(trat.productoId);
        if (!producto) {
          return ResponseService.badRequest(res, `Producto con ID ${trat.productoId} no encontrado`);
        }
      }

      // Crear el tratamiento
      const treatment = await Treatment.create({
        atr_id_paciente: consultation.atr_id_paciente,
        atr_id_medico: consultation.atr_id_medico,
        atr_id_consulta: consultationId,
        atr_fecha_inicio: new Date(),
        atr_tipo_tratamiento: trat.tipo,
        atr_numero_sesiones: trat.sesiones || 1,
        atr_observaciones: trat.observaciones || ''
      });

      // Crear las sesiones (procedimientos) para este tratamiento
      const procedures = [];
      for (let i = 1; i <= (trat.sesiones || 1); i++) {
        const procedure = await TreatmentProcedure.create({
          atr_id_tratamiento: treatment.atr_id_tratamiento,
          atr_procedimiento_tipo: 'ESTETICO', // default
          atr_procedimiento_nombre: `${trat.tipo} - Sesión ${i}`,
          atr_estado: 'PROGRAMADO',
          atr_id_medico: consultation.atr_id_medico
        });

        // Vincular producto al procedimiento si existe
        if (producto) {
          await TreatmentProcedureProduct.create({
            atr_procedimiento_id: procedure.atr_id_procedimiento,
            atr_product_id: trat.productoId,
            atr_cantidad: 1, // default
            atr_unidad: 'unidad'
          });
        }

        procedures.push(procedure);
      }

      createdTreatments.push({
        ...treatment.toJSON(),
        procedimientos: procedures
      });
    }

    // Registrar en bitácora: creación de tratamientos
    try {
      await registrarEventoBitacora(
        'CREAR_TRATAMIENTOS',
        `Tratamientos creados para consulta #${consultationId} - ${tratamientos.length} tratamientos`,
        req.user?.atr_id_usuario || 1,
        consultationId,
        req.ip || req.connection.remoteAddress
      );
    } catch (bitacoraError) {
      logger.error('Error registrando tratamientos en bitácora:', bitacoraError);
      // No fallar la creación por error en bitácora
    }

    return ResponseService.created(res, createdTreatments);

  } catch (error) {
    logger.error('Error creando tratamientos:', error);
    return ResponseService.internalError(res, 'Error al crear los tratamientos');
  }
};

exports.getTreatments = async (req, res) => {
  try {
    const { id: consultationId } = req.params;

    // Validar que la consulta existe
    const consultation = await Consultation.findByPk(consultationId);
    if (!consultation) {
      return ResponseService.notFound(res, 'Consulta no encontrada');
    }

    // Obtener todos los tratamientos para esta consulta
    const treatments = await Treatment.findAll({
      where: { atr_id_consulta: consultationId },
      include: [
        {
          model: TreatmentProcedure,
          as: 'Procedures',
          include: [
            {
              model: TreatmentProcedureProduct,
              as: 'products',
              include: [
                {
                  model: Producto,
                  as: 'product'
                }
              ]
            }
          ]
        }
      ],
      order: [['atr_fecha_inicio', 'DESC']]
    });

    return ResponseService.success(res, treatments);

  } catch (error) {
    logger.error('Error obteniendo tratamientos:', error);
    return ResponseService.internalError(res, 'Error al obtener los tratamientos');
  }
};

exports.updateTreatmentSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { ejecutado_el, resultado, recomendaciones, imagen_pre, imagen_post } = req.body;

    // Buscar el procedimiento
    const procedure = await TreatmentProcedure.findByPk(id);
    if (!procedure) {
      return ResponseService.notFound(res, 'Sesión de tratamiento no encontrada');
    }

    // Actualizar la sesión
    await procedure.update({
      atr_ejecutado_el: ejecutado_el || new Date(),
      atr_estado: 'COMPLETADO',
      atr_resultado: resultado,
      atr_recomendaciones: recomendaciones,
      atr_imagen_pre: imagen_pre,
      atr_imagen_post: imagen_post
    });

    // Registrar en bitácora: actualización de sesión de tratamiento
    try {
      await registrarEventoBitacora(
        'COMPLETAR_SESION_TRATAMIENTO',
        `Sesión de tratamiento #${id} completada`,
        req.user?.atr_id_usuario || 1,
        id,
        req.ip || req.connection.remoteAddress
      );
    } catch (bitacoraError) {
      logger.error('Error registrando sesión de tratamiento en bitácora:', bitacoraError);
      // No fallar la actualización por error en bitácora
    }

    // Obtener el procedimiento actualizado con relaciones
    const updatedProcedure = await TreatmentProcedure.findByPk(id, {
      include: [
        {
          model: Treatment,
          as: 'treatment'
        },
        {
          model: TreatmentProcedureProduct,
          as: 'products',
          include: [
            {
              model: Producto,
              as: 'product'
            }
          ]
        }
      ]
    });

    return ResponseService.success(res, updatedProcedure);

  } catch (error) {
    logger.error('Error actualizando sesión de tratamiento:', error);
    return ResponseService.internalError(res, 'Error al actualizar la sesión de tratamiento');
  }
};
