// server/Routers/adminRoutes.js
const express = require('express');
const { param, body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const {
  listUsers,
  createUser,
  blockUser,
  resetUserPassword,
  listLogs,
  deleteLogEntry,
  getPendingUsers,
  approveUser
} = require('../Controllers/adminController');

const router = express.Router();

// Middleware de validación de express-validator
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map(err => ({ field: err.param, msg: err.msg }))
    });
  }
  next();
};

// ───────── Usuarios ─────────

// Listar usuarios (paginado + búsqueda opcional)
router.get(
  '/users',
  asyncHandler(listUsers)
);

// Crear usuario
router.post(
  '/users',
  [
    body('username').notEmpty().withMessage('Usuario requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
  ],
  validate,
  asyncHandler(createUser)
);

// Bloquear usuario
router.patch(
  '/users/:id/block',
  [ param('id').isInt().withMessage('ID debe ser un número entero') ],
  validate,
  asyncHandler(blockUser)
);

// Resetear contraseña de usuario
router.put(
  '/users/:id/reset-password',
  [
    param('id').isInt().withMessage('ID debe ser un número entero'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
      .matches(/[a-z]/).withMessage('Debe contener minúscula')
      .matches(/[A-Z]/).withMessage('Debe contener mayúscula')
      .matches(/\d/).withMessage('Debe contener número')
      .matches(/[!@#$%^&*]/).withMessage('Debe contener carácter especial')
  ],
  validate,
  asyncHandler(resetUserPassword)
);

// ───────── Bitácora ─────────

// Listar logs
router.get(
  '/logs',
  asyncHandler(listLogs)
);

// Eliminar entrada de log
router.delete(
  '/logs/:id',
  [ param('id').isInt().withMessage('ID debe ser un número entero') ],
  validate,
  asyncHandler(deleteLogEntry)
);

// ──────── Pendientes ────────

// Listar usuarios pendientes de aprobación
router.get(
  '/pending-users',
  asyncHandler(getPendingUsers)
);

// Aprobar usuario pendiente
router.post(
  '/approve-user/:id',
  [ param('id').isInt().withMessage('ID inválido') ],
  validate,
  asyncHandler(approveUser)
);

// Handler para rutas no encontradas dentro de /api/admin
router.use((req, res) => {
  res.status(404).json({ error: 'Ruta de administración no encontrada' });
});

module.exports = router;








