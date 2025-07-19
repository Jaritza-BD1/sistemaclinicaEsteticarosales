const Bitacora = require('../Models/Bitacora');
const sequelize = require('../Config/db');
const ErrorHelper = require('../helpers/errorHelper');
// Si necesitas helpers utilitarios, puedes requerirlos aquí

const bitacoraService = {
  /**
   * Registra un evento en la bitácora
   * @param {Object} params
   * @returns {Promise<number>} ID del registro creado
   */
  async registrarEvento({ atr_id_usuario, atr_id_objetos, atr_accion, atr_descripcion, ip_origen = null }) {
    try {
      const bitacora = await Bitacora.create({
        atr_fecha: new Date(),
        atr_id_usuario,
        atr_id_objetos,
        atr_accion,
        atr_descripcion,
        ip_origen
      });
      return bitacora.atr_id_bitacora;
    } catch (error) {
      ErrorHelper.logError(`Error al registrar en bitácora: ${error.message}`);
      throw new Error('No se pudo registrar el evento de auditoría');
    }
  },

  /**
   * Consulta eventos de bitácora con filtros y paginación
   * @param {Object} filtros
   * @returns {Promise<Array>} Siempre retorna un array (vacío si no hay resultados)
   */
  async obtenerEventos(filtros = {}) {
    const defaultLimit = 100;
    try {
      let query = 'SELECT * FROM tbl_ms_bitacora b WHERE 1=1';
      const replacements = {};
      if (filtros.atr_id_usuario) {
        query += ' AND b.atr_id_usuario = :atr_id_usuario';
        replacements.atr_id_usuario = filtros.atr_id_usuario;
      }
      if (filtros.atr_id_objetos) {
        query += ' AND b.atr_id_objetos = :atr_id_objetos';
        replacements.atr_id_objetos = filtros.atr_id_objetos;
      }
      if (filtros.atr_accion) {
        query += ' AND b.atr_accion = :atr_accion';
        replacements.atr_accion = filtros.atr_accion;
      }
      if (filtros.fechaInicio) {
        query += ' AND b.atr_fecha >= :fechaInicio';
        replacements.fechaInicio = filtros.fechaInicio;
      }
      if (filtros.fechaFin) {
        query += ' AND b.atr_fecha <= :fechaFin';
        replacements.fechaFin = filtros.fechaFin;
      }
      const limit = parseInt(filtros.limit || defaultLimit, 10);
      const offset = parseInt(filtros.offset || 0, 10);
      query += ` ORDER BY b.atr_fecha DESC LIMIT ${limit} OFFSET ${offset}`;
      const [results] = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });
      // results puede ser undefined si no hay datos, así que devolvemos array vacío si es necesario
      return Array.isArray(results) ? results : [];
    } catch (error) {
      ErrorHelper.logError(`Error al consultar bitácora: ${error.message}`);
      throw new Error('No se pudieron obtener los registros de auditoría');
    }
  },

  /**
   * Obtiene estadísticas de actividad por usuario
   * @param {Date} [fechaInicio]
   * @param {Date} [fechaFin]
   * @returns {Promise<Array>} Siempre retorna un array
   */
  async obtenerEstadisticas(fechaInicio, fechaFin) {
    try {
      const where = {};
      if (fechaInicio || fechaFin) {
        where.atr_fecha = {};
        if (fechaInicio) where.atr_fecha['$gte'] = fechaInicio;
        if (fechaFin) where.atr_fecha['$lte'] = fechaFin;
      }
      const stats = await Bitacora.findAll({
        where,
        attributes: [
          'atr_id_usuario',
          [sequelize.fn('COUNT', sequelize.col('atr_id_bitacora')), 'total_eventos'],
          [sequelize.fn('SUM', sequelize.literal("CASE WHEN atr_accion = 'Ingreso' THEN 1 ELSE 0 END")), 'ingresos'],
          [sequelize.fn('SUM', sequelize.literal("CASE WHEN atr_accion = 'Update' THEN 1 ELSE 0 END")), 'actualizaciones'],
          [sequelize.fn('SUM', sequelize.literal("CASE WHEN atr_accion = 'Delete' THEN 1 ELSE 0 END")), 'eliminaciones']
        ],
        group: ['atr_id_usuario'],
        order: [[sequelize.literal('total_eventos'), 'DESC']]
      });
      return Array.isArray(stats) ? stats : [];
    } catch (error) {
      ErrorHelper.logError(`Error al obtener estadísticas: ${error.message}`);
      throw new Error('No se pudieron generar las estadísticas');
    }
  }
};

module.exports = bitacoraService; 