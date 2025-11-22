const { Doctor, DoctorPhone, DoctorEmail, DoctorAddress, Especialidad, MedicoEspecialidad, MedicoHorario } = require('../Models');
const sequelize = require('../Config/db');
const logger = require('../utils/logger');
const ResponseService = require('../services/responseService');

exports.list = async (req, res) => {
  try {
    const medicos = await Doctor.findAll({
      include: [
        { model: DoctorPhone, as: 'telefonos' },
        { model: DoctorEmail, as: 'correos' },
        { model: DoctorAddress, as: 'direcciones' },
        // Incluir Especialidades para que la lista también devuelva las especialidades asociadas
        { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } }
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
        { model: DoctorAddress, as: 'direcciones' },
        // Incluir Especialidades para proporcionar la relación al frontend
        { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad', 'atr_especialidad'], through: { attributes: [] } }
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
    // Usar transacción para crear médico y sus relaciones atomically
    const result = await sequelize.transaction(async (t) => {
      const medico = await Doctor.create(doctorData, { transaction: t });

      if (telefonos && telefonos.length > 0) {
        const telefonosData = telefonos.map(telefono => ({
          ...telefono,
          atr_id_medico: medico.atr_id_medico
        }));
        await DoctorPhone.bulkCreate(telefonosData, { transaction: t });
      }

      if (correos && correos.length > 0) {
        const correosData = correos.map(correo => ({
          ...correo,
          atr_id_medico: medico.atr_id_medico
        }));
        await DoctorEmail.bulkCreate(correosData, { transaction: t });
      }

      if (direcciones && direcciones.length > 0) {
        const direccionesData = direcciones.map(direccion => ({
          ...direccion,
          atr_id_medico: medico.atr_id_medico
        }));
        await DoctorAddress.bulkCreate(direccionesData, { transaction: t });
      }

      // Persistir especialidades (se espera array de ids)
      if (doctorData.especialidades && Array.isArray(doctorData.especialidades) && doctorData.especialidades.length > 0) {
        const especialidadRelations = doctorData.especialidades.map(idEsp => ({
          atr_id_medico: medico.atr_id_medico,
          atr_id_especialidad: idEsp
        }));
        await MedicoEspecialidad.bulkCreate(especialidadRelations, { transaction: t });
      }

      // Persistir horarios si vienen en el request (objeto por día)
      if (doctorData.horarios && typeof doctorData.horarios === 'object') {
        const horarioRows = [];
        Object.entries(doctorData.horarios).forEach(([day, intervals]) => {
          if (!Array.isArray(intervals)) return;
          intervals.forEach(interval => {
            if (!interval || !interval.start || !interval.end) return;
            horarioRows.push({
              atr_id_medico: medico.atr_id_medico,
              atr_dia: day,
              atr_hora_inicio: interval.start,
              atr_hora_fin: interval.end
            });
          });
        });
        if (horarioRows.length > 0) {
          await MedicoHorario.bulkCreate(horarioRows, { transaction: t });
        }
      }

      const medicoCompleto = await Doctor.findByPk(medico.atr_id_medico, {
        include: [
          { model: DoctorPhone, as: 'telefonos' },
          { model: DoctorEmail, as: 'correos' },
          { model: DoctorAddress, as: 'direcciones' },
          { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } },
          { model: MedicoHorario, as: 'Horarios', attributes: ['atr_id_horario','atr_dia','atr_hora_inicio','atr_hora_fin','atr_estado'] }
        ],
        transaction: t
      });

      return medicoCompleto;
    });

    return ResponseService.created(res, result);
  } catch (error) {
    logger.error('Error creando médico:', error);
    if (error && typeof error.message === 'string' && error.message.startsWith('Horarios inválidos')) {
      return ResponseService.badRequest(res, error.message);
    }
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

    const result = await sequelize.transaction(async (t) => {
      await medico.update(doctorData, { transaction: t });

      if (telefonos !== undefined) {
        await DoctorPhone.destroy({ where: { atr_id_medico: id }, transaction: t });
        if (telefonos.length > 0) {
          const telefonosData = telefonos.map(telefono => ({
            ...telefono,
            atr_id_medico: id
          }));
          await DoctorPhone.bulkCreate(telefonosData, { transaction: t });
        }
      }

      if (correos !== undefined) {
        await DoctorEmail.destroy({ where: { atr_id_medico: id }, transaction: t });
        if (correos.length > 0) {
          const correosData = correos.map(correo => ({
            ...correo,
            atr_id_medico: id
          }));
          await DoctorEmail.bulkCreate(correosData, { transaction: t });
        }
      }

      if (direcciones !== undefined) {
        await DoctorAddress.destroy({ where: { atr_id_medico: id }, transaction: t });
        if (direcciones.length > 0) {
          const direccionesData = direcciones.map(direccion => ({
            ...direccion,
            atr_id_medico: id
          }));
          await DoctorAddress.bulkCreate(direccionesData, { transaction: t });
        }
      }

      // Actualizar especialidades si vienen en el request (array de ids)
      if (doctorData.especialidades !== undefined) {
        await MedicoEspecialidad.destroy({ where: { atr_id_medico: id }, transaction: t });
        if (Array.isArray(doctorData.especialidades) && doctorData.especialidades.length > 0) {
          const especialidadRelations = doctorData.especialidades.map(idEsp => ({
            atr_id_medico: id,
            atr_id_especialidad: idEsp
          }));
          await MedicoEspecialidad.bulkCreate(especialidadRelations, { transaction: t });
        }
      }

      // Actualizar horarios si vienen en el request (objeto por día)
      if (doctorData.horarios !== undefined) {
        // Eliminar horarios anteriores
        await MedicoHorario.destroy({ where: { atr_id_medico: id }, transaction: t });
        // Crear nuevos si existen
        if (doctorData.horarios && typeof doctorData.horarios === 'object') {
          const horarioRows = [];
          Object.entries(doctorData.horarios).forEach(([day, intervals]) => {
            if (!Array.isArray(intervals)) return;
            intervals.forEach(interval => {
              if (!interval || !interval.start || !interval.end) return;
              horarioRows.push({
                atr_id_medico: id,
                atr_dia: day,
                atr_hora_inicio: interval.start,
                atr_hora_fin: interval.end
              });
            });
          });
          if (horarioRows.length > 0) await MedicoHorario.bulkCreate(horarioRows, { transaction: t });
        }
      }

      const medicoActualizado = await Doctor.findByPk(id, {
        include: [
          { model: DoctorPhone, as: 'telefonos' },
          { model: DoctorEmail, as: 'correos' },
          { model: DoctorAddress, as: 'direcciones' },
          { model: Especialidad, as: 'Especialidades', attributes: ['atr_id_especialidad','atr_especialidad'], through: { attributes: [] } },
          { model: MedicoHorario, as: 'Horarios', attributes: ['atr_id_horario','atr_dia','atr_hora_inicio','atr_hora_fin','atr_estado'] }
        ],
        transaction: t
      });

      return medicoActualizado;
    });

    return ResponseService.success(res, result);
  } catch (error) {
    logger.error('Error actualizando médico:', error);
    if (error && typeof error.message === 'string' && error.message.startsWith('Horarios inválidos')) {
      return ResponseService.badRequest(res, error.message);
    }
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

    await sequelize.transaction(async (t) => {
      await DoctorPhone.destroy({ where: { atr_id_medico: id }, transaction: t });
      await DoctorEmail.destroy({ where: { atr_id_medico: id }, transaction: t });
      await DoctorAddress.destroy({ where: { atr_id_medico: id }, transaction: t });
      await medico.destroy({ transaction: t });
    });

    return ResponseService.success(res, { message: 'Médico eliminado exitosamente' });
  } catch (error) {
    logger.error('Error eliminando médico:', error);
    return ResponseService.internalError(res, 'Error al eliminar el médico');
  }
};

// Obtener médicos activos para formularios
exports.getActiveDoctors = async (req, res) => {
  try {
    // Obtener médicos que tengan al menos una especialidad activa
    const medicos = await Doctor.findAll({
      include: [
        {
          model: Especialidad,
          as: 'Especialidades',
          where: { atr_estado_medico: 'ACTIVO' },
          attributes: ['atr_especialidad'],
          through: { attributes: [] }
        }
      ],
      attributes: ['atr_id_medico', 'atr_nombre', 'atr_apellido'],
      order: [['atr_nombre', 'ASC']]
    });

    const formattedDoctors = medicos.map(medico => ({
      value: medico.atr_id_medico,
      label: `Dr. ${medico.atr_nombre} ${medico.atr_apellido}`,
      especialidad: medico.Especialidades && medico.Especialidades.length > 0 ? medico.Especialidades.map(e => e.atr_especialidad).join(', ') : null
    }));

    return ResponseService.success(res, formattedDoctors);
  } catch (error) {
    logger.error('Error obteniendo médicos activos:', error);
    return ResponseService.internalError(res, 'Error al obtener médicos activos');
  }
}; 