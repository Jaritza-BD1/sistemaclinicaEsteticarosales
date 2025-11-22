const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { authenticate, isAdmin } = require('../Middlewares/authMiddleware');
const { validateRequest, patientCreateValidators, patientUpdateValidators } = require('../Middlewares/validation');
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
router.get('/types', patientCtrl.getTypes);

// Rutas CRUD principales
router.get('/', patientCtrl.list);
router.get('/:id', [param('id').isInt()], validateRequest, patientCtrl.get);
router.get('/:id/history', [param('id').isInt()], validateRequest, patientCtrl.getHistory);

router.post('/', patientCreateValidators, validateRequest, patientCtrl.create);

router.put('/:id', patientUpdateValidators, validateRequest, patientCtrl.update);

router.delete('/:id', [param('id').isInt()], validateRequest, isAdmin, patientCtrl.delete);

module.exports = router; 