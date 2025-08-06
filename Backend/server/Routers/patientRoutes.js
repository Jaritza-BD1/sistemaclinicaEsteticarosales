const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { authenticate, isAdmin } = require('../Middlewares/authMiddleware');
const { validateRequest } = require('../Middlewares/validation');
const rateLimit = require('express-rate-limit');

// Limitar peticiones para evitar brute-force
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

// Controladores
const patientCtrl = require('../Controllers/patientController');

// Todas las rutas requieren JWT y roles adecuados
router.use(authenticate);
router.use(limiter);

// Rutas para obtener datos de formulario
router.get('/active', patientCtrl.getActivePatients);

// Rutas CRUD principales
router.get('/', patientCtrl.list);
router.get('/:id', [param('id').isInt()], validateRequest, patientCtrl.get);

router.post(
  '/',
  [
    body('atr_nombre').isString().trim().isLength({ min: 2 }).withMessage('Nombre es requerido'),
    body('atr_apellido').isString().trim().isLength({ min: 2 }).withMessage('Apellido es requerido'),
    body('atr_identidad').isString().trim().isLength({ min: 10 }).withMessage('Identidad es requerida'),
    body('atr_fecha_nacimiento').isISO8601().withMessage('Fecha de nacimiento es requerida'),
    body('atr_id_genero').isInt().withMessage('Género es requerido'),
    body('atr_numero_expediente').isString().trim().withMessage('Número de expediente es requerido'),
    body('atr_estado_paciente').optional().isString(),
    body('telefonos').optional().isArray(),
    body('correos').optional().isArray(),
    body('direcciones').optional().isArray(),
    body('alergias').optional().isArray(),
    body('vacunas').optional().isArray()
  ],
  validateRequest,
  patientCtrl.create
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('atr_nombre').optional().isString().trim().isLength({ min: 2 }),
    body('atr_apellido').optional().isString().trim().isLength({ min: 2 }),
    body('atr_identidad').optional().isString().trim().isLength({ min: 10 }),
    body('atr_fecha_nacimiento').optional().isISO8601(),
    body('atr_id_genero').optional().isInt(),
    body('atr_numero_expediente').optional().isString().trim(),
    body('atr_estado_paciente').optional().isString(),
    body('telefonos').optional().isArray(),
    body('correos').optional().isArray(),
    body('direcciones').optional().isArray(),
    body('alergias').optional().isArray(),
    body('vacunas').optional().isArray()
  ],
  validateRequest,
  patientCtrl.update
);

router.delete('/:id', [param('id').isInt()], validateRequest, patientCtrl.delete);

module.exports = router; 