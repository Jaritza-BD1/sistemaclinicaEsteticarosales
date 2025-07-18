// File: server/routes/appointmentRoutes.js
const router = require('express').Router();
const { body, param } = require('express-validator');
const auth = require('../middlewares/authMiddleware');
const validate = require('../middlewares/appointmentValidation');
const rateLimit = require('express-rate-limit');

// Limitar peticiones para evitar brute-force
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

// Controladores
const appointmentCtrl = require('../Controllers/appointmentController');
const confirmCtrl = require('../Controllers/confirmationController');
const reschedCtrl = require('../Controllers/rescheduleController');
const cancelCtrl = require('../Controllers/cancelController');
const remindCtrl = require('../Controllers/reminderController');

// Todas las rutas requieren JWT y roles adecuados
router.use(auth.authenticate);
router.use(auth.authorize('ROLE_USER'));
router.use(limiter);

router.post(
  '/',
  [
    body('atr_id_paciente').isInt(),
    body('atr_id_medico').isInt(),
    body('atr_fecha_cita').isISO8601(),
    body('atr_hora_cita').matches(/^\d{2}:\d{2}$/),
    body('atr_id_tipo_cita').isInt(),
    body('atr_motivo_cita').isString().trim().escape()
  ],
  validate,
  appointmentCtrl.create
);

router.get('/', appointmentCtrl.list);
router.get('/:id', [param('id').isInt()], validate, appointmentCtrl.getById);
router.put('/:id/confirm', [param('id').isInt()], validate, confirmCtrl.confirm);
router.put('/:id/reschedule', [
    param('id').isInt(),
    body('newDate').isISO8601(),
    body('newTime').matches(/^\d{2}:\d{2}$/),
    body('reason').isString().trim().escape()
  ],
  validate,
  reschedCtrl.reschedule
);
router.post('/:id/cancel', [param('id').isInt(), body('reason').isString().trim().escape()], validate, cancelCtrl.cancel);
router.post('/reminders/send', remindCtrl.send);

module.exports = router;