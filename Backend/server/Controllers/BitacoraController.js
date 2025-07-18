const BitacoraHelper = require('../helpers/bitacoraHelper');
const logger = require('../utils/logger');

/**
 * @description Función para registrar un evento en la bitácora del sistema usando el helper y los nombres exactos de la tabla.
 * @param {string} atr_accion - El tipo de acción del evento (Ingreso, Nuevo, Update, Delete, Consulta).
 * @param {string} atr_descripcion - Información detallada del registro o actividad que se dio en el evento.
 * @param {number} atr_id_usuario - ID del usuario que realizó el evento.
 * @param {number} atr_id_objetos - ID del objeto (pantalla) donde se realizó el evento.
 * @param {string} [ip_origen] - Dirección IP de origen (opcional).
 * @returns {Promise<object>} Objeto con el resultado de la operación (éxito o error).
 */
const registrarEventoBitacora = async (atr_accion, atr_descripcion, atr_id_usuario, atr_id_objetos, ip_origen = null) => {
    try {
        if (!atr_accion || !atr_descripcion || atr_id_usuario === undefined || atr_id_objetos === undefined) {
            const error = new Error('Todos los campos de la bitácora (atr_accion, atr_descripcion, atr_id_usuario, atr_id_objetos) son requeridos.');
            logger.error(`Error de validación al registrar evento en bitácora: ${error.message}`);
            return { success: false, message: error.message };
        }
        const idRegistro = await BitacoraHelper.registrarEvento({
            atr_id_usuario,
            atr_id_objetos,
            atr_accion,
            atr_descripcion,
            ip_origen
        });
        logger.info(`Evento registrado en bitácora: ${atr_accion} - ${atr_descripcion} por usuario ${atr_id_usuario} (IP: ${ip_origen || 'N/A'})`);
        return { success: true, data: { idRegistro }, message: 'Evento de bitácora registrado exitosamente.' };
    } catch (error) {
        logger.error(`Error al registrar evento en bitácora: ${error.message}`, error.stack);
        return { success: false, message: `Error interno del servidor al registrar evento de bitácora: ${error.message}` };
    }
};

/**
 * @description Función para consultar eventos de la bitácora con filtros usando el helper y los nombres exactos de la tabla.
 * @param {object} filtros - Objeto con los filtros para la consulta (ej: { atr_id_usuario: 1, fechaInicio: '2023-01-01', fechaFin: '2023-01-31', atr_accion: 'Ingreso' })
 * @returns {Promise<Array<object>>} Array de objetos de eventos de bitácora.
 */
const consultarBitacora = async (filtros = {}) => {
    try {
        const eventos = await BitacoraHelper.obtenerEventos(filtros);
        logger.info(`Consulta de bitácora realizada con filtros: ${JSON.stringify(filtros)}. Encontrados ${eventos.length} eventos.`);
        return { success: true, data: eventos, message: 'Consulta de bitácora realizada exitosamente.' };
    } catch (error) {
        logger.error(`Error al consultar bitácora: ${error.message}`, error.stack);
        return { success: false, message: `Error interno del servidor al consultar bitácora: ${error.message}` };
    }
};

module.exports = {
    registrarEventoBitacora,
    consultarBitacora
};