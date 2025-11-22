const { MedicoHorario } = require('../Models');
const { validationResult } = require('express-validator');
const ResponseService = require('../services/responseService');
const logger = require('../utils/logger');

// Listar horarios por id de médico
exports.listByDoctor = async (req, res) => {
  try {
    const doctorId = parseInt(req.params.doctorId, 10);
    if (isNaN(doctorId)) return ResponseService.badRequest(res, 'ID de médico inválido');

    const rows = await MedicoHorario.findAll({
      where: { atr_id_medico: doctorId },
      attributes: ['atr_id_horario','atr_id_medico','atr_dia','atr_hora_inicio','atr_hora_fin','atr_estado']
    });

    return ResponseService.success(res, rows);
  } catch (error) {
    logger.error('Error listando horarios:', error);
    return ResponseService.internalError(res, 'Error al obtener horarios');
  }
};

// Crear un horario individual
exports.create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return ResponseService.validationError(res, errors);

    const { atr_id_medico, atr_dia, atr_hora_inicio, atr_hora_fin } = req.body;

    // Validaciones básicas
    if (!atr_id_medico || !atr_dia || !atr_hora_inicio || !atr_hora_fin) {
      return ResponseService.badRequest(res, 'Campos incompletos');
    }

    // formato HH:MM
    const validateTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
    if (!validateTime(atr_hora_inicio) || !validateTime(atr_hora_fin) || atr_hora_inicio >= atr_hora_fin) {
      return ResponseService.badRequest(res, 'Intervalo inválido');
    }

    const created = await MedicoHorario.create({
      atr_id_medico,
      atr_dia,
      atr_hora_inicio,
      atr_hora_fin,
      atr_creado_por: req.user?.atr_id_usuario || req.user?.id || null
    });

    return ResponseService.created(res, created);
  } catch (error) {
    logger.error('Error creando horario:', error);
    return ResponseService.internalError(res, 'Error al crear horario');
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return ResponseService.badRequest(res, 'ID inválido');

    const horario = await MedicoHorario.findByPk(id);
    if (!horario) return ResponseService.notFound(res, 'Horario no encontrado');

    const { atr_dia, atr_hora_inicio, atr_hora_fin, atr_estado } = req.body;
    const validateTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
    if ((atr_hora_inicio && !validateTime(atr_hora_inicio)) || (atr_hora_fin && !validateTime(atr_hora_fin))) {
      return ResponseService.badRequest(res, 'Formato de hora inválido');
    }
    if (atr_hora_inicio && atr_hora_fin && atr_hora_inicio >= atr_hora_fin) {
      return ResponseService.badRequest(res, 'Intervalo inválido');
    }

    await horario.update({ atr_dia, atr_hora_inicio, atr_hora_fin, atr_estado });
    return ResponseService.success(res, horario);
  } catch (error) {
    logger.error('Error actualizando horario:', error);
    return ResponseService.internalError(res, 'Error al actualizar horario');
  }
};

exports.delete = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return ResponseService.badRequest(res, 'ID inválido');

    const horario = await MedicoHorario.findByPk(id);
    if (!horario) return ResponseService.notFound(res, 'Horario no encontrado');

    await horario.destroy();
    return ResponseService.success(res, { message: 'Horario eliminado' });
  } catch (error) {
    logger.error('Error eliminando horario:', error);
    return ResponseService.internalError(res, 'Error al eliminar horario');
  }
};
