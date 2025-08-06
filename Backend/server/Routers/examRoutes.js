const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { authenticate, isAdmin } = require('../Middlewares/authMiddleware');
const { validateRequest } = require('../Middlewares/validation');
const rateLimit = require('express-rate-limit');

// Limitar peticiones para evitar brute-force
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

// Controladores
const examCtrl = require('../Controllers/examController');

// Todas las rutas requieren JWT y roles adecuados
router.use(authenticate);
router.use(limiter);

// Rutas para estadísticas
router.get('/stats', examCtrl.getStats);

// Rutas para obtener exámenes por entidad
router.get('/patient/:patientId', [param('patientId').isInt()], validateRequest, examCtrl.getByPatient);
router.get('/doctor/:doctorId', [param('doctorId').isInt()], validateRequest, examCtrl.getByDoctor);

// Rutas CRUD principales
router.get('/', examCtrl.list);
router.get('/:id', [param('id').isInt()], validateRequest, examCtrl.get);

router.post(
  '/',
  [
    body('patientId').isInt().withMessage('ID del paciente es requerido'),
    body('doctorId').isInt().withMessage('ID del médico es requerido'),
    body('examType').isString().trim().isLength({ min: 2 }).withMessage('Tipo de examen es requerido'),
    body('examName').isString().trim().isLength({ min: 2 }).withMessage('Nombre del examen es requerido'),
    body('scheduledDate').optional().isISO8601(),
    body('priority').optional().isIn(['baja', 'normal', 'alta', 'urgente']),
    body('generalObservations').optional().isString().trim(),
    body('specificObservations').optional().isString().trim(),
    body('requiresFasting').optional().isBoolean(),
    body('fastingHours').optional().isInt({ min: 0, max: 72 }),
    body('medicationsToSuspend').optional().isString().trim(),
    body('contraindications').optional().isString().trim(),
    body('preparationInstructions').optional().isString().trim(),
    body('cost').optional().isFloat({ min: 0 }),
    body('location').optional().isString().trim()
  ],
  validateRequest,
  examCtrl.create
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('patientId').optional().isInt(),
    body('doctorId').optional().isInt(),
    body('examType').optional().isString().trim().isLength({ min: 2 }),
    body('examName').optional().isString().trim().isLength({ min: 2 }),
    body('scheduledDate').optional().isISO8601(),
    body('priority').optional().isIn(['baja', 'normal', 'alta', 'urgente']),
    body('generalObservations').optional().isString().trim(),
    body('specificObservations').optional().isString().trim(),
    body('requiresFasting').optional().isBoolean(),
    body('fastingHours').optional().isInt({ min: 0, max: 72 }),
    body('medicationsToSuspend').optional().isString().trim(),
    body('contraindications').optional().isString().trim(),
    body('preparationInstructions').optional().isString().trim(),
    body('cost').optional().isFloat({ min: 0 }),
    body('location').optional().isString().trim(),
    body('estado').optional().isIn(['solicitado', 'programado', 'en_proceso', 'completado', 'cancelado'])
  ],
  validateRequest,
  examCtrl.update
);

router.delete('/:id', [param('id').isInt()], validateRequest, examCtrl.delete);

// Ruta para actualizar resultados
router.put(
  '/:id/results',
  [
    param('id').isInt(),
    body('results').isString().trim().withMessage('Resultados son requeridos'),
    body('interpretation').optional().isString().trim(),
    body('resultsDoctorId').optional().isInt(),
    body('attachments').optional().isArray()
  ],
  validateRequest,
  examCtrl.updateResults
);

module.exports = router; 