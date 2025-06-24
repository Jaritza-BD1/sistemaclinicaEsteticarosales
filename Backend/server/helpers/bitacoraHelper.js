// helpers/bitacoraHelper.js
const { sequelize } = require('../Config/db');
const { logError } = require('./errorHelper');

class BitacoraHelper {
    /**
     * Registra un evento en la bitácora del sistema
     * @param {Object} params - Parámetros del evento
     * @param {number} params.usuarioId - ID del usuario que realiza la acción
     * @param {number} params.objetoId - ID del objeto/pantalla donde ocurre el evento
     * @param {string} params.accion - Tipo de acción (Ingreso, Nuevo, Update, Delete, Consulta)
     * @param {string} params.descripcion - Descripción detallada del evento
     * @param {string} [params.ip] - Dirección IP del usuario (opcional)
     * @returns {Promise<number>} ID del registro creado
     */
    static async registrarEvento({ usuarioId, objetoId, accion, descripcion, ip = null }) {
        try {
            const [result] = await sequelize.query(
                `INSERT INTO TBL_MS_BITACORA (
                    FECHA,
                    ID_USUARIO,
                    ID_OBJETO,
                    ACCION,
                    DESCRIPCION,
                    IP_ORIGEN
                ) VALUES (
                    NOW(),
                    :usuarioId,
                    :objetoId,
                    :accion,
                    :descripcion,
                    :ip
                )`,
                {
                    replacements: { usuarioId, objetoId, accion, descripcion, ip },
                    type: sequelize.QueryTypes.INSERT
                }
            );
            
            return result;
        } catch (error) {
            logError(`Error al registrar en bitácora: ${error.message}`);
            throw new Error('No se pudo registrar el evento de auditoría');
        }
    }

    /**
     * Obtiene eventos de bitácora con filtros avanzados
     * @param {Object} [filtros] - Objeto con parámetros de filtrado
     * @param {number} [filtros.usuarioId] - Filtrar por ID de usuario
     * @param {number} [filtros.objetoId] - Filtrar por ID de objeto
     * @param {string} [filtros.accion] - Filtrar por tipo de acción
     * @param {Date} [filtros.fechaInicio] - Fecha inicial del rango
     * @param {Date} [filtros.fechaFin] - Fecha final del rango
     * @param {number} [filtros.limit=100] - Límite de resultados (default: 100)
     * @param {number} [filtros.offset=0] - Offset para paginación
     * @returns {Promise<Array>} Array de registros de bitácora
     */
    static async obtenerEventos(filtros = {}) {
        const defaultLimit = 100;
        try {
            let query = `
                SELECT 
                    b.ID_BITACORA,
                    b.FECHA,
                    u.USUARIO AS nombre_usuario,
                    o.NOMBRE_OBJETO,
                    b.ACCION,
                    b.DESCRIPCION,
                    b.IP_ORIGEN,
                    TIMESTAMPDIFF(SECOND, b.FECHA, NOW()) AS segundos_transcurridos
                FROM TBL_MS_BITACORA b
                LEFT JOIN TBL_MS_USUARIO u ON b.ID_USUARIO = u.ID_USUARIO
                LEFT JOIN TBL_MS_OBJETOS o ON b.ID_OBJETO = o.ID_OBJETO
                WHERE 1=1
            `;
            
            const replacements = {
                limit: filtros.limit || defaultLimit,
                offset: filtros.offset || 0
            };

            // Construcción dinámica de filtros
            if (filtros.usuarioId) {
                query += ' AND b.ID_USUARIO = :usuarioId';
                replacements.usuarioId = filtros.usuarioId;
            }
            
            if (filtros.objetoId) {
                query += ' AND b.ID_OBJETO = :objetoId';
                replacements.objetoId = filtros.objetoId;
            }
            
            if (filtros.accion) {
                query += ' AND b.ACCION = :accion';
                replacements.accion = filtros.accion;
            }
            
            if (filtros.fechaInicio) {
                query += ' AND b.FECHA >= :fechaInicio';
                replacements.fechaInicio = filtros.fechaInicio;
            }
            
            if (filtros.fechaFin) {
                query += ' AND b.FECHA <= :fechaFin';
                replacements.fechaFin = filtros.fechaFin;
            }
            
            query += ' ORDER BY b.FECHA DESC LIMIT :limit OFFSET :offset';
            
            const [results] = await sequelize.query(query, {
                replacements,
                type: sequelize.QueryTypes.SELECT
            });
            
            return results;
        } catch (error) {
            logError(`Error al consultar bitácora: ${error.message}`);
            throw new Error('No se pudieron obtener los registros de auditoría');
        }
    }

    /**
     * Obtiene estadísticas de actividad por usuario
     * @param {Date} [fechaInicio] - Fecha inicial del período
     * @param {Date} [fechaFin] - Fecha final del período
     * @returns {Promise<Array>} Estadísticas de actividad
     */
    static async obtenerEstadisticas(fechaInicio, fechaFin) {
        try {
            const [results] = await sequelize.query(
                `SELECT 
                    u.ID_USUARIO,
                    u.USUARIO,
                    COUNT(b.ID_BITACORA) AS total_eventos,
                    SUM(CASE WHEN b.ACCION = 'Ingreso' THEN 1 ELSE 0 END) AS ingresos,
                    SUM(CASE WHEN b.ACCION = 'Update' THEN 1 ELSE 0 END) AS actualizaciones,
                    SUM(CASE WHEN b.ACCION = 'Delete' THEN 1 ELSE 0 END) AS eliminaciones
                FROM TBL_MS_USUARIO u
                LEFT JOIN TBL_MS_BITACORA b ON u.ID_USUARIO = b.ID_USUARIO
                WHERE (:fechaInicio IS NULL OR b.FECHA >= :fechaInicio)
                AND (:fechaFin IS NULL OR b.FECHA <= :fechaFin)
                GROUP BY u.ID_USUARIO, u.USUARIO
                ORDER BY total_eventos DESC`,
                {
                    replacements: { fechaInicio, fechaFin },
                    type: sequelize.QueryTypes.SELECT
                }
            );
            
            return results;
        } catch (error) {
            logError(`Error al obtener estadísticas: ${error.message}`);
            throw new Error('No se pudieron generar las estadísticas');
        }
    }
}

module.exports = BitacoraHelper;