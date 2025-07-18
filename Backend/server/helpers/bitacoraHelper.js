// helpers/bitacoraHelper.js
const Bitacora = require('../Models/Bitacora');
const ErrorHelper = require('./errorHelper');

class BitacoraHelper {
    /**
     * Registra un evento en la bitácora del sistema usando los nombres exactos de la tabla.
     * @param {Object} params - Parámetros del evento
     * @param {number} params.atr_id_usuario - ID del usuario que realiza la acción
     * @param {number} params.atr_id_objetos - ID del objeto/pantalla donde ocurre el evento
     * @param {string} params.atr_accion - Tipo de acción (Ingreso, Nuevo, Update, Delete, Consulta)
     * @param {string} params.atr_descripcion - Descripción detallada del evento
     * @param {string} [params.ip_origen] - Dirección IP del usuario (opcional)
     * @returns {Promise<number>} ID del registro creado
     */
    static async registrarEvento({ atr_id_usuario, atr_id_objetos, atr_accion, atr_descripcion, ip_origen = null }) {
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
    }

    /**
     * Obtiene eventos de bitácora con filtros avanzados usando los nombres exactos de la tabla
     * @param {Object} [filtros] - Objeto con parámetros de filtrado
     * @param {number} [filtros.atr_id_usuario] - Filtrar por ID de usuario
     * @param {number} [filtros.atr_id_objetos] - Filtrar por ID de objeto
     * @param {string} [filtros.atr_accion] - Filtrar por tipo de acción
     * @param {Date} [filtros.fechaInicio] - Fecha inicial del rango
     * @param {Date} [filtros.fechaFin] - Fecha final del rango
     * @param {number} [filtros.limit=100] - Límite de resultados (default: 100)
     * @param {number} [filtros.offset=0] - Offset para paginación
     * @returns {Promise<Array>} Array de registros de bitácora
     */
    static async obtenerEventos(filtros = {}) {
        const defaultLimit = 100;
        try {
            const sequelize = require('../Config/db');
            let query = 'SELECT * FROM tbl_ms_bitacora b WHERE 1=1';
            const replacements = {};

            // Construcción dinámica de filtros
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
            // Interpolar LIMIT y OFFSET directamente
            const limit = parseInt(filtros.limit || defaultLimit, 10);
            const offset = parseInt(filtros.offset || 0, 10);
            query += ` ORDER BY b.atr_fecha DESC LIMIT ${limit} OFFSET ${offset}`;
            const [results] = await sequelize.query(query, {
                replacements,
                type: sequelize.QueryTypes.SELECT
            });
            return results;
        } catch (error) {
            ErrorHelper.logError(`Error al consultar bitácora: ${error.message}`);
            throw new Error('No se pudieron obtener los registros de auditoría');
        }
    }

    /**
     * Obtiene estadísticas de actividad por usuario usando los nombres exactos de la tabla
     * @param {Date} [fechaInicio] - Fecha inicial del período
     * @param {Date} [fechaFin] - Fecha final del período
     * @returns {Promise<Array>} Estadísticas de actividad
     */
    static async obtenerEstadisticas(fechaInicio, fechaFin) {
        const sequelize = require('../Config/db');
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
            return stats;
        } catch (error) {
            ErrorHelper.logError(`Error al obtener estadísticas: ${error.message}`);
            throw new Error('No se pudieron generar las estadísticas');
        }
    }
}

module.exports = BitacoraHelper;