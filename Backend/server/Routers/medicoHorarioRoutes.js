const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { authenticate } = require('../Middlewares/authMiddleware');
const { validateRequest } = require('../Middlewares/validation');
const ctrl = require('../Controllers/medicoHorarioController');

// Proteger rutas
router.use(authenticate);

// Listar por medico
router.get('/doctor/:doctorId', [param('doctorId').isInt()], validateRequest, ctrl.listByDoctor);

// Crear
router.post('/', [
  body('atr_id_medico').isInt(),
  body('atr_dia').isString().notEmpty(),
  body('atr_hora_inicio').matches(/^([01]\d|2[0-3]):[0-5]\d$/),
  body('atr_hora_fin').matches(/^([01]\d|2[0-3]):[0-5]\d$/)
], validateRequest, ctrl.create);

// Update
router.put('/:id', [param('id').isInt()], validateRequest, ctrl.update);

// Delete
router.delete('/:id', [param('id').isInt()], validateRequest, ctrl.delete);

module.exports = router;
