const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { authenticate } = require('../Middlewares/authMiddleware');
const { validateRequest } = require('../Middlewares/validation');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
const consultationCtrl = require('../Controllers/consultationController');

router.use(authenticate);
router.use(limiter);

router.get('/', consultationCtrl.list);
router.get('/:id', [param('id').isInt()], validateRequest, consultationCtrl.get);
router.get('/appointment/:appointmentId', [param('appointmentId').isInt()], validateRequest, consultationCtrl.getByAppointment);

router.post(
  '/',
  [
    body('appointmentId').isInt().withMessage('ID de cita es requerido'),
    body('pacienteId').isInt().withMessage('ID de paciente es requerido'),
    body('medicoId').isInt().withMessage('ID de médico es requerido'),
    body('sintomas').optional().isString().isLength({ max: 200 }).withMessage('Síntomas no pueden exceder 200 caracteres'),
    body('diagnostico').optional().isString().isLength({ max: 200 }).withMessage('Diagnóstico no puede exceder 200 caracteres'),
    body('observaciones').optional().isString(),
    body('peso').optional().isFloat({ min: 0, max: 500 }).withMessage('Peso debe ser un número válido entre 0 y 500'),
    body('altura').optional().isFloat({ min: 0, max: 3 }).withMessage('Altura debe ser un número válido entre 0 y 3 metros'),
    body('temperatura').optional().isFloat({ min: 30, max: 45 }).withMessage('Temperatura debe estar entre 30°C y 45°C'),
    body('seguimiento').optional().isBoolean(),
    body('sigVisitDia').isISO8601().withMessage('Fecha de siguiente visita inválida')
  ],
  validateRequest,
  consultationCtrl.create
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('sintomas').optional().isString().isLength({ max: 200 }).withMessage('Síntomas no pueden exceder 200 caracteres'),
    body('diagnostico').optional().isString().isLength({ max: 200 }).withMessage('Diagnóstico no puede exceder 200 caracteres'),
    body('observaciones').optional().isString(),
    body('peso').optional().isFloat({ min: 0, max: 500 }).withMessage('Peso debe ser un número válido entre 0 y 500'),
    body('altura').optional().isFloat({ min: 0, max: 3 }).withMessage('Altura debe ser un número válido entre 0 y 3 metros'),
    body('temperatura').optional().isFloat({ min: 30, max: 45 }).withMessage('Temperatura debe estar entre 30°C y 45°C'),
    body('seguimiento').optional().isBoolean(),
    body('sigVisitDia').optional().isISO8601().withMessage('Fecha de siguiente visita inválida')
  ],
  validateRequest,
  consultationCtrl.update
);

router.put(
  '/:id/finalize',
  [
    param('id').isInt(),
    body('atr_diagnostico').optional().isString(),
    body('atr_observaciones').optional().isString()
  ],
  validateRequest,
  consultationCtrl.finalize
);

router.post('/:id/finish', [param('id').isInt()], validateRequest, consultationCtrl.finishConsultation);

// Órdenes de examen
router.post('/:id/exams', [
  param('id').isInt(),
  body('exams').isArray({ min: 1 }).withMessage('Debe proporcionar al menos un examen'),
  body('exams.*.nombre').isString().trim().isLength({ min: 1 }).withMessage('Nombre del examen es requerido'),
  body('exams.*.observacion').optional().isString().trim()
], validateRequest, consultationCtrl.createExamOrder);

router.get('/:id/exams', [param('id').isInt()], validateRequest, consultationCtrl.getExamOrders);

// Recetas médicas
router.post('/:id/prescriptions', [
  param('id').isInt(),
  body('medicamentos').isArray({ min: 1 }).withMessage('Debe proporcionar al menos un medicamento'),
  body('medicamentos.*.medicamentoId').isInt().withMessage('ID del medicamento es requerido'),
  body('medicamentos.*.dosis').isString().trim().isLength({ min: 1 }).withMessage('Dosis es requerida'),
  body('medicamentos.*.duracion').isString().trim().isLength({ min: 1 }).withMessage('Duración es requerida'),
  body('medicamentos.*.frecuencia').optional().isString().trim(),
  body('medicamentos.*.nombre').optional().isString().trim()
], validateRequest, consultationCtrl.createPrescription);

router.get('/:id/prescriptions', [param('id').isInt()], validateRequest, consultationCtrl.getPrescriptions);

// Tratamientos
router.post('/:id/treatments', [
  param('id').isInt(),
  body('tratamientos').isArray({ min: 1 }).withMessage('Debe proporcionar al menos un tratamiento'),
  body('tratamientos.*.tipo').isString().trim().isLength({ min: 1 }).withMessage('Tipo de tratamiento es requerido'),
  body('tratamientos.*.productoId').optional().isInt(),
  body('tratamientos.*.sesiones').optional().isInt({ min: 1 }).withMessage('Número de sesiones debe ser mayor a 0')
], validateRequest, consultationCtrl.createTreatments);

router.get('/:id/treatments', [param('id').isInt()], validateRequest, consultationCtrl.getTreatments);

router.delete('/:id', [param('id').isInt()], validateRequest, consultationCtrl.delete);

module.exports = router;
