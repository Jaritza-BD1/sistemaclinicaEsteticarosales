const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { authenticate, isAdmin } = require('../Middlewares/authMiddleware');
const { validateRequest } = require('../Middlewares/validation');
const rateLimit = require('express-rate-limit');

// Limitar peticiones para evitar brute-force
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

// Controladores
const treatmentCtrl = require('../Controllers/treatmentController');

// Todas las rutas requieren JWT y roles adecuados
router.use(authenticate);
router.use(limiter);

// Rutas para estadísticas
router.get('/stats', treatmentCtrl.getStats);

// Rutas para obtener tratamientos por entidad
router.get('/patient/:patientId', [param('patientId').isInt()], validateRequest, treatmentCtrl.getByPatient);
router.get('/doctor/:doctorId', [param('doctorId').isInt()], validateRequest, treatmentCtrl.getByDoctor);

// Rutas CRUD principales
router.get('/', treatmentCtrl.list);
router.get('/:id', [param('id').isInt()], validateRequest, treatmentCtrl.get);

router.post(
  '/',
  [
    body('patientId').isInt().withMessage('ID del paciente es requerido'),
    body('doctorId').isInt().withMessage('ID del médico es requerido'),
    body('description').optional().isString().trim(),
    body('startDate').isISO8601().withMessage('Fecha de inicio es requerida'),
    body('endDate').optional().isISO8601(),
    body('observations').optional().isString().trim()
  ],
  validateRequest,
  treatmentCtrl.create
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('patientId').optional().isInt(),
    body('doctorId').optional().isInt(),
    body('description').optional().isString().trim(),
    body('startDate').optional().isISO8601(),
    body('endDate').optional().isISO8601(),
    body('observations').optional().isString().trim()
  ],
  validateRequest,
  treatmentCtrl.update
);

router.delete('/:id', [param('id').isInt()], validateRequest, treatmentCtrl.delete);

module.exports = router; 