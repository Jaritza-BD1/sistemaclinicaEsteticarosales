const express = require('express');
const router = express.Router();
const { param, query } = require('express-validator');
const { validateRequest } = require('../Middlewares/validation');
const especialidadCtrl = require('../Controllers/especialidadController');

// Opcional: proteger con middleware de autenticación si se desea
// const { authenticate } = require('../Middlewares/authMiddleware');
// router.use(authenticate);

// GET / => lista de especialidades, soporta ?active=true
router.get('/', [
  query('active').optional().isIn(['true','false'])
], validateRequest, especialidadCtrl.list);

// GET /:id
router.get('/:id', [param('id').isInt()], validateRequest, especialidadCtrl.get);

module.exports = router;
