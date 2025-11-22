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

// Actualizar estado de receta
router.put('/:id/status', [
  param('id').isInt(),
  body('estado').isIn(['PENDIENTE_ENTREGA', 'ENTREGADA', 'CANCELADA']).withMessage('Estado inválido')
], validateRequest, consultationCtrl.updatePrescriptionStatus);

module.exports = router;