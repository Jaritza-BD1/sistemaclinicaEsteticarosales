const express = require('express');
const router = express.Router();
const paymentController = require('../Controllers/paymentController');
const { authenticate } = require('../Middlewares/authMiddleware');

/**
 * Rutas para gestión de pagos de citas
 */

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener citas pendientes de pago
router.get('/pending', paymentController.getPendingPayments);

// Obtener estadísticas de pagos pendientes
router.get('/stats', paymentController.getPaymentStats);

// Procesar pago de una cita específica
router.post('/:appointmentId/pay', paymentController.payAppointment);

module.exports = router;