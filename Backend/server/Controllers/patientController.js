const { Patient, PatientPhone, PatientEmail, PatientAddress } = require('../Models');
const logger = require('../utils/logger');
const ResponseService = require('../services/responseService');

exports.list = async (req, res) => {
  try {
    const pacientes = await Patient.findAll({
      include: [
        { model: PatientPhone, as: 'telefonos' },
        { model: PatientEmail, as: 'correos' },
        { model: PatientAddress, as: 'direcciones' }
      ],
      order: [['atr_nombre', 'ASC']]
    });
    
    return ResponseService.success(res, pacientes);
  } catch (error) {
    logger.error('Error listando pacientes:', error);
    return ResponseService.internalError(res, 'Error al obtener la lista de pacientes');
  }
};

exports.get = async (req, res) => {
  try {
    const paciente = await Patient.findByPk(req.params.id, {
      include: [
        { model: PatientPhone, as: 'telefonos' },
        { model: PatientEmail, as: 'correos' },
        { model: PatientAddress, as: 'direcciones' }
      ]
    });
    
    if (!paciente) {
      return ResponseService.notFound(res, 'Paciente no encontrado');
    }
    
    return ResponseService.success(res, paciente);
  } catch (error) {
    logger.error('Error obteniendo paciente:', error);
    return ResponseService.internalError(res, 'Error al obtener el paciente');
  }
};

exports.create = async (req, res) => {
  try {
    const { telefonos, correos, direcciones, alergias, vacunas, ...patientData } = req.body;
    
    // Crear el paciente
    const paciente = await Patient.create(patientData);
    
    // Crear teléfonos si se proporcionan
    if (telefonos && telefonos.length > 0) {
      const telefonosData = telefonos.map(telefono => ({
        ...telefono,
        atr_id_paciente: paciente.atr_id_paciente
      }));
      await PatientPhone.bulkCreate(telefonosData);
    }
    
    // Crear correos si se proporcionan
    if (correos && correos.length > 0) {
      const correosData = correos.map(correo => ({
        ...correo,
        atr_id_paciente: paciente.atr_id_paciente
      }));
      await PatientEmail.bulkCreate(correosData);
    }
    
    // Crear direcciones si se proporcionan
    if (direcciones && direcciones.length > 0) {
      const direccionesData = direcciones.map(direccion => ({
        ...direccion,
        atr_id_paciente: paciente.atr_id_paciente
      }));
      await PatientAddress.bulkCreate(direccionesData);
    }
    
    // Obtener el paciente con todas las relaciones
    const pacienteCompleto = await Patient.findByPk(paciente.atr_id_paciente, {
      include: [
        { model: PatientPhone, as: 'telefonos' },
        { model: PatientEmail, as: 'correos' },
        { model: PatientAddress, as: 'direcciones' }
      ]
    });
    
    return ResponseService.created(res, pacienteCompleto);
  } catch (error) {
    logger.error('Error creando paciente:', error);
    return ResponseService.internalError(res, 'Error al crear el paciente');
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { telefonos, correos, direcciones, alergias, vacunas, ...patientData } = req.body;
    
    const paciente = await Patient.findByPk(id);
    if (!paciente) {
      return ResponseService.notFound(res, 'Paciente no encontrado');
    }
    
    // Actualizar datos del paciente
    await paciente.update(patientData);
    
    // Actualizar teléfonos
    if (telefonos !== undefined) {
      await PatientPhone.destroy({ where: { atr_id_paciente: id } });
      if (telefonos.length > 0) {
        const telefonosData = telefonos.map(telefono => ({
          ...telefono,
          atr_id_paciente: id
        }));
        await PatientPhone.bulkCreate(telefonosData);
      }
    }
    
    // Actualizar correos
    if (correos !== undefined) {
      await PatientEmail.destroy({ where: { atr_id_paciente: id } });
      if (correos.length > 0) {
        const correosData = correos.map(correo => ({
          ...correo,
          atr_id_paciente: id
        }));
        await PatientEmail.bulkCreate(correosData);
      }
    }
    
    // Actualizar direcciones
    if (direcciones !== undefined) {
      await PatientAddress.destroy({ where: { atr_id_paciente: id } });
      if (direcciones.length > 0) {
        const direccionesData = direcciones.map(direccion => ({
          ...direccion,
          atr_id_paciente: id
        }));
        await PatientAddress.bulkCreate(direccionesData);
      }
    }
    
    // Obtener el paciente actualizado con todas las relaciones
    const pacienteActualizado = await Patient.findByPk(id, {
      include: [
        { model: PatientPhone, as: 'telefonos' },
        { model: PatientEmail, as: 'correos' },
        { model: PatientAddress, as: 'direcciones' }
      ]
    });
    
    return ResponseService.success(res, pacienteActualizado);
  } catch (error) {
    logger.error('Error actualizando paciente:', error);
    return ResponseService.internalError(res, 'Error al actualizar el paciente');
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const paciente = await Patient.findByPk(id);
    if (!paciente) {
      return ResponseService.notFound(res, 'Paciente no encontrado');
    }
    
    // Eliminar registros relacionados
    await PatientPhone.destroy({ where: { atr_id_paciente: id } });
    await PatientEmail.destroy({ where: { atr_id_paciente: id } });
    await PatientAddress.destroy({ where: { atr_id_paciente: id } });
    
    // Eliminar el paciente
    await paciente.destroy();
    
    return ResponseService.success(res, { message: 'Paciente eliminado exitosamente' });
  } catch (error) {
    logger.error('Error eliminando paciente:', error);
    return ResponseService.internalError(res, 'Error al eliminar el paciente');
  }
};

// Obtener pacientes activos para formularios
exports.getActivePatients = async (req, res) => {
  try {
    const pacientes = await Patient.findAll({
      where: { atr_estado_paciente: 'ACTIVO' },
      attributes: ['atr_id_paciente', 'atr_nombre', 'atr_apellido', 'atr_numero_expediente'],
      order: [['atr_nombre', 'ASC']]
    });
    
    const formattedPatients = pacientes.map(paciente => ({
      value: paciente.atr_id_paciente,
      label: `${paciente.atr_nombre} ${paciente.atr_apellido}`,
      expediente: paciente.atr_numero_expediente
    }));
    
    return ResponseService.success(res, formattedPatients);
  } catch (error) {
    logger.error('Error obteniendo pacientes activos:', error);
    return ResponseService.internalError(res, 'Error al obtener pacientes activos');
  }
}; 