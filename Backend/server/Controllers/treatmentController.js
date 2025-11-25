const { Treatment, Patient, Doctor, User, Especialidad, TreatmentProcedure } = require('../Models');
const logger = require('../utils/logger');
const ResponseService = require('../services/responseService');

exports.list = async (req, res) => {
  try {
    const treatments = await Treatment.findAll({
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        },
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
          include: [ { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } } ]
        }
      ],
      order: [['atr_fecha_inicio', 'DESC']]
    });
    
    return ResponseService.success(res, treatments);
  } catch (error) {
    logger.error('Error listando tratamientos:', error);
    return ResponseService.internalError(res, 'Error al obtener la lista de tratamientos');
  }
};

exports.get = async (req, res) => {
  try {
    const treatment = await Treatment.findByPk(req.params.id, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        },
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
          include: [ { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } } ]
        }
      ]
    });
    
    if (!treatment) {
      return ResponseService.notFound(res, 'Tratamiento no encontrado');
    }
    
    return ResponseService.success(res, treatment);
  } catch (error) {
    logger.error('Error obteniendo tratamiento:', error);
    return ResponseService.internalError(res, 'Error al obtener el tratamiento');
  }
};

exports.create = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      treatmentType,
      description,
      startDate,
      endDate,
      frequency,
      duration,
      medications,
      observations,
      status = 'ACTIVO'
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

    const treatment = await Treatment.create({
      atr_id_paciente: patientId,
      atr_id_medico: doctorId,
      atr_fecha_inicio: startDate,
      atr_fecha_fin: endDate,
      atr_diagnostico: description,
      atr_observaciones: observations
    });

    // Obtener el tratamiento con las relaciones
    const treatmentWithRelations = await Treatment.findByPk(treatment.atr_id_tratamiento, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        },
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
          include: [ { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } } ]
        }
      ]
    });

    return ResponseService.created(res, treatmentWithRelations);
  } catch (error) {
    logger.error('Error creando tratamiento:', error);
    return ResponseService.internalError(res, 'Error al crear el tratamiento');
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      patientId,
      doctorId,
      treatmentType,
      description,
      startDate,
      endDate,
      frequency,
      duration,
      medications,
      observations,
      status
    } = req.body;

    const treatment = await Treatment.findByPk(id);
    if (!treatment) {
      return ResponseService.notFound(res, 'Tratamiento no encontrado');
    }

    // Verificar que el paciente existe si se está actualizando
    if (patientId) {
      const patient = await Patient.findByPk(patientId);
      if (!patient) {
        return ResponseService.badRequest(res, 'Paciente no encontrado');
      }
    }

    // Verificar que el médico existe si se está actualizando
    if (doctorId) {
      const doctor = await Doctor.findByPk(doctorId);
      if (!doctor) {
        return ResponseService.badRequest(res, 'Médico no encontrado');
      }
    }

    await treatment.update({
      atr_id_paciente: patientId || treatment.atr_id_paciente,
      atr_id_medico: doctorId || treatment.atr_id_medico,
      atr_fecha_inicio: startDate || treatment.atr_fecha_inicio,
      atr_fecha_fin: endDate || treatment.atr_fecha_fin,
      atr_diagnostico: description || treatment.atr_diagnostico,
      atr_observaciones: observations || treatment.atr_observaciones
    });

    // Obtener el tratamiento actualizado con las relaciones
    const updatedTreatment = await Treatment.findByPk(id, {
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        },
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
          include: [ { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } } ]
        }
      ]
    });

    return ResponseService.success(res, updatedTreatment);
  } catch (error) {
    logger.error('Error actualizando tratamiento:', error);
    return ResponseService.internalError(res, 'Error al actualizar el tratamiento');
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const treatment = await Treatment.findByPk(id);
    if (!treatment) {
      return ResponseService.notFound(res, 'Tratamiento no encontrado');
    }
    // Soft-clear: en lugar de eliminar la fila (que puede romper FKs), limpiamos los campos de datos
    // Conservamos las FK (atr_id_paciente, atr_id_medico, etc.) para mantener integridad referencial
    await treatment.update({
      atr_fecha_fin: null,
      atr_diagnostico: null,
      atr_observaciones: null,
      atr_numero_sesiones: null,
      atr_tipo_tratamiento: null
    });
    
    return ResponseService.success(res, { message: 'Datos del tratamiento borrados (fila conservada)' });
  } catch (error) {
    logger.error('Error eliminando tratamiento:', error);
    return ResponseService.internalError(res, 'Error al eliminar el tratamiento');
  }
};

// Obtener tratamientos por paciente
exports.getByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const treatments = await Treatment.findAll({
      where: { atr_id_paciente: patientId },
      include: [
        { 
          model: Doctor, 
          as: 'doctor',
          attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
          include: [ { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } } ]
        }
      ],
      order: [['atr_fecha_inicio', 'DESC']]
    });
    
    return ResponseService.success(res, treatments);
  } catch (error) {
    logger.error('Error obteniendo tratamientos por paciente:', error);
    return ResponseService.internalError(res, 'Error al obtener tratamientos del paciente');
  }
};

// Obtener tratamientos por médico
exports.getByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const treatments = await Treatment.findAll({
      where: { atr_id_medico: doctorId },
      include: [
        { 
          model: Patient, 
          as: 'patient',
          attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente']
        }
      ],
      order: [['atr_fecha_inicio', 'DESC']]
    });
    
    return ResponseService.success(res, treatments);
  } catch (error) {
    logger.error('Error obteniendo tratamientos por médico:', error);
    return ResponseService.internalError(res, 'Error al obtener tratamientos del médico');
  }
};

// Obtener estadísticas de tratamientos
exports.getStats = async (req, res) => {
  try {
    const totalTreatments = await Treatment.count();
    const activeTreatments = await Treatment.count({ where: { atr_estado: 'ACTIVO' } });
    const completedTreatments = await Treatment.count({ where: { atr_estado: 'COMPLETADO' } });
    const cancelledTreatments = await Treatment.count({ where: { atr_estado: 'CANCELADO' } });

    const stats = {
      total: totalTreatments,
      active: activeTreatments,
      completed: completedTreatments,
      cancelled: cancelledTreatments
    };

    return ResponseService.success(res, stats);
  } catch (error) {
    logger.error('Error obteniendo estadísticas de tratamientos:', error);
    return ResponseService.internalError(res, 'Error al obtener estadísticas');
  }
}; 