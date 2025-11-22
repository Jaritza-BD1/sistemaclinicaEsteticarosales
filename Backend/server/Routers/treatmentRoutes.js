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
const treatmentProcedureCtrl = require('../Controllers/treatmentProcedureController');
const consultationCtrl = require('../Controllers/consultationController');
const { uploadFields } = require('../helpers/uploadHelper');

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

// Actualizar sesión de tratamiento (para consultas)
router.patch('/:id/session', [
  param('id').isInt(),
  body('ejecutado_el').optional().isISO8601().withMessage('Fecha de ejecución inválida'),
  body('resultado').optional().isString().trim(),
  body('recomendaciones').optional().isString().trim(),
  body('imagen_pre').optional().isString().trim(),
  body('imagen_post').optional().isString().trim()
], validateRequest, consultationCtrl.updateTreatmentSession);

// Rutas anidadas para procedimientos de un tratamiento
router.get('/:treatmentId/procedures', [param('treatmentId').isInt()], validateRequest, treatmentProcedureCtrl.listByTreatment);
router.get('/:treatmentId/procedures/:procId', [param('treatmentId').isInt(), param('procId').isInt()], validateRequest, treatmentProcedureCtrl.get);

router.post(
  '/:treatmentId/procedures',
  [
    param('treatmentId').isInt(),
    body('atr_procedimiento_tipo').isIn(['ESTETICO','PODOLOGICO']).withMessage('Tipo de procedimiento inválido'),
    body('atr_procedimiento_nombre').isString().notEmpty().withMessage('Nombre de procedimiento requerido'),
    body('atr_programado_para').optional().isISO8601()
  ],
  validateRequest,
  treatmentProcedureCtrl.create
);

router.put('/:treatmentId/procedures/:procId', [param('treatmentId').isInt(), param('procId').isInt()], validateRequest, treatmentProcedureCtrl.update);

router.patch(
  '/:treatmentId/procedures/:procId/execute',
  [param('treatmentId').isInt(), param('procId').isInt()],
  // aceptar uploads: imagen_pre e imagen_post (opcionales)
  // guardar en subcarpeta `procedures/<treatmentId>` y validar imágenes hasta 5MB
  uploadFields(
    req => `procedures/${req.params.treatmentId}`,
    [
      { name: 'imagen_pre', maxCount: 1 },
      { name: 'imagen_post', maxCount: 1 }
    ],
    { maxSize: 5 * 1024 * 1024, allowedMimes: ['image/jpeg','image/png','image/gif','image/webp','application/pdf'] }
  ),
  validateRequest,
  treatmentProcedureCtrl.execute
);

module.exports = router; 