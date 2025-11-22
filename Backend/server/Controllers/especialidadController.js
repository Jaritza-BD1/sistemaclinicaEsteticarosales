const { Especialidad } = require('../Models');
const ResponseService = require('../services/responseService');
const logger = require('../utils/logger');

exports.list = async (req, res) => {
  try {
    // Permitir query ?active=true para filtrar solo activas
    const where = {};
    if (req.query.active === 'true') {
      where.atr_estado_medico = 'ACTIVO';
    }

    const especialidades = await Especialidad.findAll({
      where,
      attributes: ['atr_id_especialidad', 'atr_especialidad', 'atr_descripcion', 'atr_estado_medico'],
      order: [['atr_especialidad', 'ASC']]
    });

    return ResponseService.success(res, especialidades);
  } catch (error) {
    logger.error('Error obteniendo especialidades:', error);
    return ResponseService.internalError(res, 'Error al obtener especialidades');
  }
};

exports.get = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const esp = await Especialidad.findByPk(id, {
      attributes: ['atr_id_especialidad', 'atr_especialidad', 'atr_descripcion', 'atr_estado_medico']
    });

    if (!esp) return ResponseService.notFound(res, 'Especialidad no encontrada');
    return ResponseService.success(res, esp);
  } catch (error) {
    logger.error('Error obteniendo especialidad:', error);
    return ResponseService.internalError(res, 'Error al obtener especialidad');
  }
};