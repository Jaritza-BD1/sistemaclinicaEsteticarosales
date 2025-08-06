const { Exam, Patient, Doctor, User } = require('../Models');
const logger = require('../utils/logger');
const ResponseService = require('../services/responseService');

exports.list = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        },
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido', 'atr_especialidad_principal']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return ResponseService.success(res, exams);
  } catch (error) {
    logger.error('Error listando exámenes:', error);
    return ResponseService.internalError(res, 'Error al obtener la lista de exámenes');
  }
};

exports.get = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        },
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido', 'atr_especialidad_principal']
        },
        {
          model: Doctor,
          as: 'resultsDoctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido', 'atr_especialidad_principal']
        }
      ]
    });
    
    if (!exam) {
      return ResponseService.notFound(res, 'Examen no encontrado');
    }
    
    return ResponseService.success(res, exam);
  } catch (error) {
    logger.error('Error obteniendo examen:', error);
    return ResponseService.internalError(res, 'Error al obtener el examen');
  }
};

exports.create = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      examType,
      examName,
      scheduledDate,
      priority = 'normal',
      generalObservations,
      specificObservations,
      requiresFasting = false,
      fastingHours,
      medicationsToSuspend,
      contraindications,
      preparationInstructions,
      cost,
      location
    } = req.body;

    // Verificar que el paciente existe
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return ResponseService.badRequest(res, 'Paciente no encontrado');
    }

    // Verificar que el médico existe
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return ResponseService.badRequest(res, 'Médico no encontrado');
    }

    const exam = await Exam.create({
      atr_id_paciente: patientId,
      atr_id_medico: doctorId,
      atr_tipo_examen: examType,
      atr_nombre_examen: examName,
      atr_fecha_programada: scheduledDate,
      atr_prioridad: priority,
      atr_observaciones_generales: generalObservations,
      atr_observaciones_especificas: specificObservations,
      atr_requiere_ayuno: requiresFasting,
      atr_horas_ayuno: fastingHours,
      atr_medicamentos_suspender: medicationsToSuspend,
      atr_contraindicaciones: contraindications,
      atr_instrucciones_preparacion: preparationInstructions,
      atr_costo: cost,
      atr_ubicacion: location,
      atr_estado: 'solicitado'
    });

    // Obtener el examen con las relaciones
    const examWithRelations = await Exam.findByPk(exam.atr_id_examen, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        },
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido', 'atr_especialidad_principal']
        }
      ]
    });

    return ResponseService.created(res, examWithRelations);
  } catch (error) {
    logger.error('Error creando examen:', error);
    return ResponseService.internalError(res, 'Error al crear el examen');
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const exam = await Exam.findByPk(id);
    if (!exam) {
      return ResponseService.notFound(res, 'Examen no encontrado');
    }

    // Verificar que el paciente existe si se está actualizando
    if (updateData.patientId) {
      const patient = await Patient.findByPk(updateData.patientId);
      if (!patient) {
        return ResponseService.badRequest(res, 'Paciente no encontrado');
      }
    }

    // Verificar que el médico existe si se está actualizando
    if (updateData.doctorId) {
      const doctor = await Doctor.findByPk(updateData.doctorId);
      if (!doctor) {
        return ResponseService.badRequest(res, 'Médico no encontrado');
      }
    }

    await exam.update(updateData);

    // Obtener el examen actualizado con las relaciones
    const updatedExam = await Exam.findByPk(id, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        },
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido', 'atr_especialidad_principal']
        },
        {
          model: Doctor,
          as: 'resultsDoctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido', 'atr_especialidad_principal']
        }
      ]
    });

    return ResponseService.success(res, updatedExam);
  } catch (error) {
    logger.error('Error actualizando examen:', error);
    return ResponseService.internalError(res, 'Error al actualizar el examen');
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exam = await Exam.findByPk(id);
    if (!exam) {
      return ResponseService.notFound(res, 'Examen no encontrado');
    }
    
    await exam.destroy();
    
    return ResponseService.success(res, { message: 'Examen eliminado exitosamente' });
  } catch (error) {
    logger.error('Error eliminando examen:', error);
    return ResponseService.internalError(res, 'Error al eliminar el examen');
  }
};

// Actualizar resultados del examen
exports.updateResults = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      results,
      interpretation,
      resultsDoctorId,
      attachments
    } = req.body;

    const exam = await Exam.findByPk(id);
    if (!exam) {
      return ResponseService.notFound(res, 'Examen no encontrado');
    }

    // Verificar que el médico de resultados existe si se proporciona
    if (resultsDoctorId) {
      const doctor = await Doctor.findByPk(resultsDoctorId);
      if (!doctor) {
        return ResponseService.badRequest(res, 'Médico de resultados no encontrado');
      }
    }

    await exam.update({
      atr_resultados: results,
      atr_interpretacion: interpretation,
      atr_medico_resultados: resultsDoctorId,
      atr_archivos_adjuntos: attachments,
      atr_fecha_resultados: new Date(),
      atr_estado: 'completado'
    });

    // Obtener el examen actualizado con las relaciones
    const updatedExam = await Exam.findByPk(id, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        },
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido', 'atr_especialidad_principal']
        },
        {
          model: Doctor,
          as: 'resultsDoctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido', 'atr_especialidad_principal']
        }
      ]
    });

    return ResponseService.success(res, updatedExam);
  } catch (error) {
    logger.error('Error actualizando resultados del examen:', error);
    return ResponseService.internalError(res, 'Error al actualizar los resultados');
  }
};

// Obtener exámenes por paciente
exports.getByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const exams = await Exam.findAll({
      where: { atr_id_paciente: patientId },
      include: [
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido', 'atr_especialidad_principal']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return ResponseService.success(res, exams);
  } catch (error) {
    logger.error('Error obteniendo exámenes por paciente:', error);
    return ResponseService.internalError(res, 'Error al obtener exámenes del paciente');
  }
};

// Obtener exámenes por médico
exports.getByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const exams = await Exam.findAll({
      where: { atr_id_medico: doctorId },
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return ResponseService.success(res, exams);
  } catch (error) {
    logger.error('Error obteniendo exámenes por médico:', error);
    return ResponseService.internalError(res, 'Error al obtener exámenes del médico');
  }
};

// Obtener estadísticas de exámenes
exports.getStats = async (req, res) => {
  try {
    const totalExams = await Exam.count();
    const requestedExams = await Exam.count({ where: { atr_estado: 'solicitado' } });
    const inProcessExams = await Exam.count({ where: { atr_estado: 'en_proceso' } });
    const completedExams = await Exam.count({ where: { atr_estado: 'completado' } });
    const cancelledExams = await Exam.count({ where: { atr_estado: 'cancelado' } });

    const stats = {
      total: totalExams,
      requested: requestedExams,
      inProcess: inProcessExams,
      completed: completedExams,
      cancelled: cancelledExams
    };

    return ResponseService.success(res, stats);
  } catch (error) {
    logger.error('Error obteniendo estadísticas de exámenes:', error);
    return ResponseService.internalError(res, 'Error al obtener estadísticas');
  }
}; 