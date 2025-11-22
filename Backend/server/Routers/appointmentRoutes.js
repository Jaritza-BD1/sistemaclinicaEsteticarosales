// File: server/routes/appointmentRoutes.js
const router = require('express').Router();
const { body, param } = require('express-validator');
const { authenticate, isAdmin } = require('../Middlewares/authMiddleware');
const { authorizeAppointment } = require('../Middlewares/appointmentMiddleware');
const { validateRequest } = require('../Middlewares/validation');
const { create, update, reschedule } = require('../Middlewares/appointmentValidation');
const rateLimit = require('express-rate-limit');
const { ESTADOS_RECORDATORIO } = require('../utils/reminderUtils');
const authMiddleware = require('../Middlewares/authMiddlewares');
const adminMiddleware = require('../Middlewares/adminMiddleware');

// Limitar peticiones para evitar brute-force
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

// Controladores
const appointmentCtrl = require('../Controllers/appointmentController');

// Todas las rutas requieren JWT y roles adecuados
router.use(authenticate);
router.use(authorizeAppointment);
router.use(limiter);

// Rutas para obtener datos de formulario
router.get('/patients', appointmentCtrl.getPatients);
router.get('/doctors', appointmentCtrl.getDoctors);
router.get('/states', appointmentCtrl.getAppointmentStates);
router.get('/types', appointmentCtrl.getAppointmentTypes);
router.get('/today', appointmentCtrl.getTodayAppointments);
router.get('/calendar', appointmentCtrl.getCalendarAppointments);

// Rutas CRUD principales
router.post(
  '/',
  create,
  appointmentCtrl.createAppointment
);

router.get('/', appointmentCtrl.listAppointments);
router.get('/:id', [param('id').isInt()], validateRequest, appointmentCtrl.getById);

router.put(
  '/:id',
  [param('id').isInt()],
  update,
  appointmentCtrl.updateAppointment
);

router.patch('/:id/status', [param('id').isInt()], appointmentCtrl.updateStatus);

router.post(
  '/:id/start-consultation',
  [param('id').isInt()],
  validateRequest,
  appointmentCtrl.startConsultation
);

router.delete('/:id', [param('id').isInt()], validateRequest, appointmentCtrl.delete);

// Rutas para operaciones específicas
router.put('/:id/confirm', [param('id').isInt()], validateRequest, appointmentCtrl.confirm);

router.post(
  '/:id/register-confirmation',
  [
    param('id').isInt(),
    body('medio').isIn(['llamada', 'WhatsApp', 'email', 'otro']),
    body('notas').optional().isString().trim().escape()
  ],
  validateRequest,
  appointmentCtrl.registerConfirmation
);

router.post(
  '/:id/register-reminder',
  [
    param('id').isInt(),
    body('fechaHoraEnvio').isISO8601(),
    body('medio').isIn(['sms', 'email', 'notificación app'])
  ],
  validateRequest,
  appointmentCtrl.registerReminder
);

router.post(
  '/:id/reminders',
  [
    param('id').isInt(),
    body('medio').optional().isIn(['sms', 'email', 'notificación app'])
  ],
  validateRequest,
  appointmentCtrl.createReminder
);

router.get(
  '/:id/reminders',
  [param('id').isInt()],
  validateRequest,
  appointmentCtrl.getReminders
);

router.put(
  '/:id/reminders/:reminderId/cancel',
  [
    param('id').isInt(),
    param('reminderId').isInt(),
    body('reason').optional().isString().trim().escape()
  ],
  validateRequest,
  appointmentCtrl.cancelReminder
);

router.put(
  '/:id/reminders/:reminderId/status',
  [
    param('id').isInt(),
    param('reminderId').isInt(),
    body('estado').isIn(Object.values(ESTADOS_RECORDATORIO)),
    body('contenido').optional().isString().trim().escape()
  ],
  validateRequest,
  appointmentCtrl.updateReminderStatus
);

// Ruta para check-in de pacientes
router.post(
  '/:id/checkin',
  [param('id').isInt()],
  validateRequest,
  appointmentCtrl.checkIn
);

router.patch(
  '/:id/checkin',
  [param('id').isInt()],
  validateRequest,
  appointmentCtrl.checkInAppointment
);

router.post(
  '/:id/reschedule',
  [param('id').isInt()],
  reschedule,
  appointmentCtrl.reschedule
);

router.post(
  '/:id/cancel',
  [
    param('id').isInt(),
    body('reason').optional().isString().trim().escape()
  ],
  validateRequest,
  appointmentCtrl.cancel
);

// Rutas para pagos
// Lista de citas en PENDIENTE_PAGO
router.get(
  '/pending-payment',
  authenticate,
  // opcional: middleware de rol caja:
  // cajaMiddleware,
  appointmentCtrl.getPendingPaymentAppointments
);

// Marcar cita como pagada (FINALIZADA)
router.post(
  '/:id/pay',
  authenticate,
  // opcional: cajaMiddleware,
  appointmentCtrl.payAppointment
);

module.exports = router;