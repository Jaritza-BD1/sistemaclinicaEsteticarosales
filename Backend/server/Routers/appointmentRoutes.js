// File: server/routes/appointmentRoutes.js
const router = require('express').Router();
const { body, param } = require('express-validator');
const { authenticate, isAdmin } = require('../Middlewares/authMiddleware');
const { authorizeAppointment } = require('../Middlewares/appointmentMiddleware');
const { validateRequest } = require('../Middlewares/validation');
const rateLimit = require('express-rate-limit');

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

// Rutas CRUD principales
router.post(
  '/',
  [
    body('atr_id_paciente').isInt().withMessage('ID de paciente es requerido'),
    body('atr_id_medico').isInt().withMessage('ID de médico es requerido'),
    body('atr_fecha_cita').isISO8601().withMessage('Fecha de cita es requerida'),
    body('atr_hora_cita').matches(/^\d{2}:\d{2}$/).withMessage('Hora de cita es requerida'),
    body('atr_id_tipo_cita').isInt().withMessage('Tipo de cita es requerido'),
    body('atr_motivo_cita').isString().trim().escape().withMessage('Motivo de cita es requerido'),
    body('atr_id_estado').optional().isInt(),
    body('reminder').optional().isISO8601()
  ],
  validateRequest,
  appointmentCtrl.create
);

router.get('/', appointmentCtrl.list);
router.get('/:id', [param('id').isInt()], validateRequest, appointmentCtrl.getById);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('atr_id_paciente').optional().isInt(),
    body('atr_id_medico').optional().isInt(),
    body('atr_fecha_cita').optional().isISO8601(),
    body('atr_hora_cita').optional().matches(/^\d{2}:\d{2}$/),
    body('atr_id_tipo_cita').optional().isInt(),
    body('atr_motivo_cita').optional().isString().trim().escape(),
    body('atr_id_estado').optional().isInt(),
    body('reminder').optional().isISO8601()
  ],
  validateRequest,
  appointmentCtrl.update
);

router.delete('/:id', [param('id').isInt()], validateRequest, appointmentCtrl.delete);

// Rutas para operaciones específicas
router.put('/:id/confirm', [param('id').isInt()], validateRequest, appointmentCtrl.confirm);

router.put(
  '/:id/reschedule',
  [
    param('id').isInt(),
    body('atr_fecha_cita').isISO8601().withMessage('Nueva fecha es requerida'),
    body('atr_hora_cita').matches(/^\d{2}:\d{2}$/).withMessage('Nueva hora es requerida'),
    body('atr_motivo_cita').optional().isString().trim().escape()
  ],
  validateRequest,
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

module.exports = router;