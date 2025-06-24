const { sequelize } = require('../Config/db');
const { logError } = require('../helpers/errorHelper');

/**
 * Middleware para registrar eventos en la bitácora
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar
 */
const registrarEvento = async (req, res, next) => {
    // Validación básica de la solicitud
    if (!req || !req.method || !req.path) {
        logError('Solicitud inválida para bitácora', { req });
        return next();
    }

    try {
        // 1. Verificar conexión a la base de datos
        if (!sequelize) {
            throw new Error('Conexión a base de datos no disponible');
        }

        // 2. Obtener datos del usuario autenticado
        const usuarioId = req.user?.id || null;
        const objetoId = obtenerIdObjeto(req);

        // 3. Validar datos mínimos
        if (!usuarioId) {
            logError('Usuario no autenticado en registro de bitácora', {
                path: req.path,
                method: req.method
            });
            return next();
        }

        // 4. Registrar el evento en la bitácora
        const [result] = await sequelize.query(
            `CALL REGISTRAR_BITACORA(
                :fecha,
                :usuarioId, 
                :objetoId, 
                :accion, 
                :descripcion,
                :ipOrigen
            )`,
            {
                replacements: {
                    fecha: new Date(),
                    usuarioId,
                    objetoId: objetoId || null,
                    accion: req.method,
                    descripcion: `Acción en ${req.path}`,
                    ipOrigen: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
                },
                type: sequelize.QueryTypes.SELECT
            }
        );

        // 5. Verificar resultado del procedimiento
        if (!result || result.affectedRows === 0) {
            logError('Bitácora no registrada', {
                usuarioId,
                objetoId,
                accion: req.method
            });
        }

    } catch (error) {
        logError('Error en middleware de bitácora', {
            error: error.message,
            stack: error.stack,
            endpoint: req.originalUrl,
            userId: req.user?.id
        });
    } finally {
        // Siempre continuar el flujo
        next();
    }
};

/**
 * Función para extraer el ID del objeto afectado
 * @param {Object} req - Objeto de solicitud
 * @returns {Number|null} - ID del objeto o null
 */
function obtenerIdObjeto(req) {
    try {
        // Prioridad 1: Parámetro de ruta (/:id)
        if (req.params && req.params.id) {
            return parseInt(req.params.id) || null;
        }

        // Prioridad 2: Body de la solicitud
        if (req.body && req.body.id) {
            return parseInt(req.body.id) || null;
        }

        // Prioridad 3: Query parameters (?id=)
        if (req.query && req.query.id) {
            return parseInt(req.query.id) || null;
        }

        return null;
    } catch (error) {
        logError('Error al obtener ID de objeto', {
            error: error.message,
            params: req.params,
            body: req.body,
            query: req.query
        });
        return null;
    }
}

module.exports = registrarEvento;