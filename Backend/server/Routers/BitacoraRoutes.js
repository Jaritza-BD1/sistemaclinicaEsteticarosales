const express = require('express');
const router = express.Router();
const bitacoraController = require('../Controllers/BitacoraController');
const { authenticate } = require('../Middlewares/authMiddleware');
const { validateRequest } = require('../Middlewares/validation');
const { body, query } = require('express-validator');

// Proteger todas las rutas de bitácora con autenticación
router.use(authenticate);

// Ruta para registrar un evento en la bitácora
router.post(
  '/bitacora/registrar',
  [
    body('accion').isString().notEmpty().withMessage('Acción requerida'),
    body('descripcion').isString().notEmpty().withMessage('Descripción requerida'),
    body('idUsuario').isInt({ min: 1 }).withMessage('ID de usuario requerido y debe ser entero'),
    body('idObjeto').isInt({ min: 1 }).withMessage('ID de objeto requerido y debe ser entero'),
    validateRequest
  ],
  async (req, res) => {
    const { accion, descripcion, idUsuario, idObjeto } = req.body;
    const result = await bitacoraController.registrarEventoBitacora(accion, descripcion, idUsuario, idObjeto);
    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(500).json(result);
    }
  }
);

// Ruta para consultar eventos de la bitácora
router.get(
  '/bitacora/consultar',
  [
    // Filtros opcionales, pero si vienen deben ser válidos
    query('atr_id_usuario').optional().isInt({ min: 1 }).withMessage('ID de usuario debe ser entero'),
    query('atr_id_objetos').optional().isInt({ min: 1 }).withMessage('ID de objeto debe ser entero'),
    query('atr_accion').optional().isString(),
    query('fechaInicio').optional().isISO8601().withMessage('Fecha inicio debe ser YYYY-MM-DD'),
    query('fechaFin').optional().isISO8601().withMessage('Fecha fin debe ser YYYY-MM-DD'),
    query('limit').optional().isInt({ min: 1, max: 500 }),
    query('offset').optional().isInt({ min: 0 }),
    validateRequest
  ],
  async (req, res) => {
    const filtros = req.query;
    const result = await bitacoraController.consultarBitacora(filtros);
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  }
);

// Ruta para consultar estadísticas de la bitácora
router.get(
  '/bitacora/estadisticas',
  [
    query('fechaInicio').optional().isISO8601().withMessage('Fecha inicio debe ser YYYY-MM-DD'),
    query('fechaFin').optional().isISO8601().withMessage('Fecha fin debe ser YYYY-MM-DD'),
    validateRequest
  ],
  async (req, res) => {
    const { fechaInicio, fechaFin } = req.query;
    const result = await bitacoraController.consultarEstadisticasBitacora(fechaInicio, fechaFin);
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  }
);

module.exports = router;