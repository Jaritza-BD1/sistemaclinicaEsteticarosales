const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { authenticate, isAdmin } = require('../Middlewares/authMiddleware');
const { validateRequest } = require('../Middlewares/validation');
const rateLimit = require('express-rate-limit');

// Limitar peticiones para evitar brute-force
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

// Controladores
const doctorCtrl = require('../Controllers/doctorController');

// Todas las rutas requieren JWT y roles adecuados
router.use(authenticate);
router.use(limiter);

// Rutas para obtener datos de formulario
router.get('/active', doctorCtrl.getActiveDoctors);

// Rutas CRUD principales
router.get('/', doctorCtrl.list);
router.get('/:id', [param('id').isInt()], validateRequest, doctorCtrl.get);

router.post(
  '/',
  [
    body('atr_nombre').isString().trim().isLength({ min: 2 }).withMessage('Nombre es requerido'),
    body('atr_apellido').isString().trim().isLength({ min: 2 }).withMessage('Apellido es requerido'),
    body('atr_identidad').isString().trim().isLength({ min: 10 }).withMessage('Identidad es requerida'),
    body('atr_fecha_nacimiento').isISO8601().withMessage('Fecha de nacimiento es requerida'),
    body('atr_id_genero').isInt().withMessage('Género es requerido'),
    body('atr_numero_colegiado').isString().trim().withMessage('Número de colegiado es requerido'),
    body('atr_especialidad_principal').isString().trim().withMessage('Especialidad es requerida'),
    body('atr_estado_medico').optional().isString(),
    body('telefonos').optional().isArray(),
    body('correos').optional().isArray(),
    body('direcciones').optional().isArray()
  ],
  validateRequest,
  doctorCtrl.create
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
    body('atr_numero_colegiado').optional().isString().trim(),
    body('atr_especialidad_principal').optional().isString().trim(),
    body('atr_estado_medico').optional().isString(),
    body('telefonos').optional().isArray(),
    body('correos').optional().isArray(),
    body('direcciones').optional().isArray()
  ],
  validateRequest,
  doctorCtrl.update
);

router.delete('/:id', [param('id').isInt()], validateRequest, doctorCtrl.delete);

module.exports = router; 