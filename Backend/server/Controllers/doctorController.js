const { Doctor, DoctorPhone, DoctorEmail, DoctorAddress } = require('../Models');
const logger = require('../utils/logger');
const ResponseService = require('../services/responseService');

exports.list = async (req, res) => {
  try {
    const medicos = await Doctor.findAll({
      include: [
        { model: DoctorPhone, as: 'telefonos' },
        { model: DoctorEmail, as: 'correos' },
        { model: DoctorAddress, as: 'direcciones' }
      ],
      order: [['atr_nombre', 'ASC']]
    });
    
    return ResponseService.success(res, medicos);
  } catch (error) {
    logger.error('Error listando médicos:', error);
    return ResponseService.internalError(res, 'Error al obtener la lista de médicos');
  }
};

exports.get = async (req, res) => {
  try {
    const medico = await Doctor.findByPk(req.params.id, {
      include: [
        { model: DoctorPhone, as: 'telefonos' },
        { model: DoctorEmail, as: 'correos' },
        { model: DoctorAddress, as: 'direcciones' }
      ]
    });
    
    if (!medico) {
      return ResponseService.notFound(res, 'Médico no encontrado');
    }
    
    return ResponseService.success(res, medico);
  } catch (error) {
    logger.error('Error obteniendo médico:', error);
    return ResponseService.internalError(res, 'Error al obtener el médico');
  }
};

exports.create = async (req, res) => {
  try {
    const { telefonos, correos, direcciones, ...doctorData } = req.body;
    
    // Crear el médico
    const medico = await Doctor.create(doctorData);
    
    // Crear teléfonos si se proporcionan
    if (telefonos && telefonos.length > 0) {
      const telefonosData = telefonos.map(telefono => ({
        ...telefono,
        atr_id_medico: medico.atr_id_medico
      }));
      await DoctorPhone.bulkCreate(telefonosData);
    }
    
    // Crear correos si se proporcionan
    if (correos && correos.length > 0) {
      const correosData = correos.map(correo => ({
        ...correo,
        atr_id_medico: medico.atr_id_medico
      }));
      await DoctorEmail.bulkCreate(correosData);
    }
    
    // Crear direcciones si se proporcionan
    if (direcciones && direcciones.length > 0) {
      const direccionesData = direcciones.map(direccion => ({
        ...direccion,
        atr_id_medico: medico.atr_id_medico
      }));
      await DoctorAddress.bulkCreate(direccionesData);
    }
    
    // Obtener el médico con todas las relaciones
    const medicoCompleto = await Doctor.findByPk(medico.atr_id_medico, {
      include: [
        { model: DoctorPhone, as: 'telefonos' },
        { model: DoctorEmail, as: 'correos' },
        { model: DoctorAddress, as: 'direcciones' }
      ]
    });
    
    return ResponseService.created(res, medicoCompleto);
  } catch (error) {
    logger.error('Error creando médico:', error);
    return ResponseService.internalError(res, 'Error al crear el médico');
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { telefonos, correos, direcciones, ...doctorData } = req.body;
    
    const medico = await Doctor.findByPk(id);
    if (!medico) {
      return ResponseService.notFound(res, 'Médico no encontrado');
    }
    
    // Actualizar datos del médico
    await medico.update(doctorData);
    
    // Actualizar teléfonos
    if (telefonos !== undefined) {
      await DoctorPhone.destroy({ where: { atr_id_medico: id } });
      if (telefonos.length > 0) {
        const telefonosData = telefonos.map(telefono => ({
          ...telefono,
          atr_id_medico: id
        }));
        await DoctorPhone.bulkCreate(telefonosData);
      }
    }
    
    // Actualizar correos
    if (correos !== undefined) {
      await DoctorEmail.destroy({ where: { atr_id_medico: id } });
      if (correos.length > 0) {
        const correosData = correos.map(correo => ({
          ...correo,
          atr_id_medico: id
        }));
        await DoctorEmail.bulkCreate(correosData);
      }
    }
    
    // Actualizar direcciones
    if (direcciones !== undefined) {
      await DoctorAddress.destroy({ where: { atr_id_medico: id } });
      if (direcciones.length > 0) {
        const direccionesData = direcciones.map(direccion => ({
          ...direccion,
          atr_id_medico: id
        }));
        await DoctorAddress.bulkCreate(direccionesData);
      }
    }
    
    // Obtener el médico actualizado con todas las relaciones
    const medicoActualizado = await Doctor.findByPk(id, {
      include: [
        { model: DoctorPhone, as: 'telefonos' },
        { model: DoctorEmail, as: 'correos' },
        { model: DoctorAddress, as: 'direcciones' }
      ]
    });
    
    return ResponseService.success(res, medicoActualizado);
  } catch (error) {
    logger.error('Error actualizando médico:', error);
    return ResponseService.internalError(res, 'Error al actualizar el médico');
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    
    const medico = await Doctor.findByPk(id);
    if (!medico) {
      return ResponseService.notFound(res, 'Médico no encontrado');
    }
    
    // Eliminar registros relacionados
    await DoctorPhone.destroy({ where: { atr_id_medico: id } });
    await DoctorEmail.destroy({ where: { atr_id_medico: id } });
    await DoctorAddress.destroy({ where: { atr_id_medico: id } });
    
    // Eliminar el médico
    await medico.destroy();
    
    return ResponseService.success(res, { message: 'Médico eliminado exitosamente' });
  } catch (error) {
    logger.error('Error eliminando médico:', error);
    return ResponseService.internalError(res, 'Error al eliminar el médico');
  }
};

// Obtener médicos activos para formularios
exports.getActiveDoctors = async (req, res) => {
  try {
    const medicos = await Doctor.findAll({
      where: { atr_estado_medico: 'ACTIVO' },
      attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido', 'atr_especialidad_principal'],
      order: [['atr_nombre', 'ASC']]
    });
    
    const formattedDoctors = medicos.map(medico => ({
      value: medico.atr_id_medico,
      label: `Dr. ${medico.atr_nombre} ${medico.atr_apellido}`,
      especialidad: medico.atr_especialidad_principal
    }));
    
    return ResponseService.success(res, formattedDoctors);
  } catch (error) {
    logger.error('Error obteniendo médicos activos:', error);
    return ResponseService.internalError(res, 'Error al obtener médicos activos');
  }
}; 