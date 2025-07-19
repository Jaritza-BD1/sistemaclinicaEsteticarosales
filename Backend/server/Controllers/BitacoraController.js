const bitacoraService = require('../services/bitacoraService');
const logger = require('../utils/logger');

/**
 * @description Función para registrar un evento en la bitácora del sistema usando el service.
 */
const registrarEventoBitacora = async (atr_accion, atr_descripcion, atr_id_usuario, atr_id_objetos, ip_origen = null) => {
    try {
        if (!atr_accion || !atr_descripcion || atr_id_usuario === undefined || atr_id_objetos === undefined) {
            const error = new Error('Todos los campos de la bitácora (atr_accion, atr_descripcion, atr_id_usuario, atr_id_objetos) son requeridos.');
            logger.error(`Error de validación al registrar evento en bitácora: ${error.message}`);
            return { success: false, message: error.message };
        }
        const idRegistro = await bitacoraService.registrarEvento({
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
 * @description Función para consultar eventos de la bitácora con filtros usando el service.
 */
const consultarBitacora = async (filtros = {}) => {
    try {
        const eventos = await bitacoraService.obtenerEventos(filtros);
        logger.info(`Consulta de bitácora realizada con filtros: ${JSON.stringify(filtros)}. Encontrados ${eventos.length} eventos.`);
        return { success: true, data: eventos, message: 'Consulta de bitácora realizada exitosamente.' };
    } catch (error) {
        logger.error(`Error al consultar bitácora: ${error.message}`, error.stack);
        return { success: false, message: `Error interno del servidor al consultar bitácora: ${error.message}` };
    }
};

/**
 * @description Función para consultar estadísticas de la bitácora usando el service.
 */
const consultarEstadisticasBitacora = async (fechaInicio, fechaFin) => {
    try {
        const stats = await bitacoraService.obtenerEstadisticas(fechaInicio, fechaFin);
        logger.info(`Consulta de estadísticas de bitácora para fechas: ${fechaInicio} - ${fechaFin}. Encontrados ${stats.length} usuarios.`);
        return { success: true, data: stats, message: 'Consulta de estadísticas realizada exitosamente.' };
    } catch (error) {
        logger.error(`Error al consultar estadísticas de bitácora: ${error.message}`, error.stack);
        return { success: false, message: `Error interno del servidor al consultar estadísticas de bitácora: ${error.message}` };
    }
};

module.exports = {
    registrarEventoBitacora,
    consultarBitacora,
    consultarEstadisticasBitacora
};