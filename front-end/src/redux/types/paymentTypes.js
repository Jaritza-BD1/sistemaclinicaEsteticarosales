// src/redux/types/paymentTypes.js
// Tipos de datos para el sistema de pagos (JavaScript con JSDoc)

/**
 * @typedef {Object} PaymentData
 * @property {string} paymentMethod - Método de pago ('cash', 'card', 'transfer', etc.)
 * @property {number} amount - Monto del pago
 * @property {string} [reference] - Referencia del pago
 * @property {string} [notes] - Notas adicionales del pago
 */

/**
 * @typedef {Object} PaymentState
 * @property {Array} pendingPayments - Lista de citas pendientes de pago
 * @property {string} paymentStatus - Estado de las operaciones de pago
 * @property {string|null} paymentError - Mensaje de error de pagos
 */

/**
 * @typedef {Object} PaymentActions
 * @property {Function} fetchPendingPayments - Carga pagos pendientes
 * @property {Function} payAppointment - Procesa un pago
 * @property {Function} clearError - Limpia errores de pago
 * @property {Function} clearPayments - Limpia lista de pagos pendientes
 */

/**
 * @typedef {Object} UsePaymentsHook
 * @property {Array} pendingPayments - Citas pendientes de pago
 * @property {boolean} isLoading - Si está cargando
 * @property {boolean} isSuccess - Si la operación fue exitosa
 * @property {boolean} isError - Si hubo error
 * @property {string|null} error - Mensaje de error
 * @property {Function} fetchPendingPayments - Función para cargar pagos
 * @property {Function} payAppointment - Función para procesar pago
 * @property {Function} clearError - Función para limpiar error
 * @property {Function} clearPayments - Función para limpiar pagos
 */

// Exportar tipos para uso en JSDoc
export const PAYMENT_TYPES = {
  METHODS: ['cash', 'card', 'transfer', 'check'],
  STATUSES: ['idle', 'loading', 'succeeded', 'failed']
};