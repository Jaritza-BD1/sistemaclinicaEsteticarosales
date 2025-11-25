// utils/reminderUtils.js
const { EstadoBitacoraRecordatorio } = require('../Models');

/**
 * Estados válidos para recordatorios
 */
const ESTADOS_RECORDATORIO = {
  ENVIADO: 'ENVIADO',
  ENTREGADO: 'ENTREGADO',
  REBOTADO: 'REBOTADO',
  ERROR: 'ERROR',
  CANCELADO: 'CANCELADO',
  PENDIENTE: 'PENDIENTE',
  REINTENTO: 'REINTENTO'
};

/**
 * Tarea 2.4.1 – Crear función de utilidad registrarEstadoRecordatorio
 * Registra un cambio de estado en la bitácora de recordatorios
 *
 * @param {number} recordatorioId - ID del recordatorio
 * @param {string} estado - Estado del recordatorio (usar constantes ESTADOS_RECORDATORIO)
 * @param {string} contenido - Descripción del cambio de estado
 * @param {boolean} cancelacion - Indica si es una cancelación (default: false)
 * @returns {Promise} Promise que resuelve con el registro creado
 */
async function registrarEstadoRecordatorio(recordatorioId, estado, contenido, cancelacion = false, options = {}) {
  // Validar estado
  const estadosValidos = Object.values(ESTADOS_RECORDATORIO);
  if (!estadosValidos.includes(estado)) {
    throw new Error(`Estado no válido: ${estado}. Estados válidos: ${estadosValidos.join(', ')}`);
  }

  return EstadoBitacoraRecordatorio.create({
    atr_id_recordatorio: recordatorioId,
    atr_estado_recordatorio: estado,
    atr_contenido: contenido,
    atr_cancelacion: cancelacion,
  }, options);
}

/**
 * Función de utilidad para reintentos automáticos
 * @param {number} recordatorioId - ID del recordatorio
 * @param {number} numeroReintento - Número del reintento
 * @returns {Promise}
 */
async function registrarReintento(recordatorioId, numeroReintento) {
  return registrarEstadoRecordatorio(
    recordatorioId,
    ESTADOS_RECORDATORIO.REINTENTO,
    `Reintento automático #${numeroReintento}`,
    false
  );
}

/**
 * Función de utilidad para confirmar entrega
 * @param {number} recordatorioId - ID del recordatorio
 * @param {string} detalles - Detalles de la confirmación (opcional)
 * @returns {Promise}
 */
async function confirmarEntrega(recordatorioId, detalles = '') {
  return registrarEstadoRecordatorio(
    recordatorioId,
    ESTADOS_RECORDATORIO.ENTREGADO,
    `Recordatorio entregado exitosamente${detalles ? ': ' + detalles : ''}`,
    false
  );
}

module.exports = {
  registrarEstadoRecordatorio,
  registrarReintento,
  confirmarEntrega,
  ESTADOS_RECORDATORIO,
};