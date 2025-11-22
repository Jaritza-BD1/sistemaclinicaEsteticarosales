// server/Routers/adminRoutes.js
const express = require('express');
const { param, body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const adminController = require('../Controllers/adminController'); // <--- Importación necesaria
const { authenticate, isAdmin, authenticateAdmin } = require('../Middlewares/authMiddlewares');
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
// Requiere autenticación y ser administrador
router.get(
  '/users',
  authenticateAdmin,
  asyncHandler(listUsers)
);

// Crear usuario (solo admin)
router.post(
  '/users',
  authenticateAdmin,
  [
    body('username').notEmpty().withMessage('Usuario requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
  ],
  validate,
  asyncHandler(createUser)
);

// Bloquear usuario (solo admin)
router.patch(
  '/users/:id/block',
  authenticateAdmin,
  [ param('id').isInt().withMessage('ID debe ser un número entero') ],
  validate,
  asyncHandler(blockUser)
);

// Resetear contraseña de usuario (solo admin)
// El controlador genera la nueva contraseña internamente, por lo que NO
// requerimos recibir `newPassword` en el body desde el front-end.
router.put(
  '/users/:id/reset-password',
  authenticateAdmin,
  [ param('id').isInt().withMessage('ID debe ser un número entero') ],
  validate,
  asyncHandler(resetUserPassword)
);

// Desbloquear usuario (solo admin)
router.patch('/users/:id/unblock', authenticateAdmin, asyncHandler(adminController.unblockUser));
// Eliminar usuario (solo admin)
router.delete('/users/:id', authenticateAdmin, asyncHandler(adminController.deleteUser));

// Uploads preview and manual cleanup (admin only)
router.get('/uploads/preview', authenticateAdmin, asyncHandler(adminController.uploadsPreview));
router.post('/uploads/cleanup', authenticateAdmin, asyncHandler(adminController.runUploadsCleanup));
router.get('/uploads/trash', authenticateAdmin, asyncHandler(adminController.listTrash));
router.post('/uploads/trash/restore', authenticateAdmin, asyncHandler(adminController.restoreTrashFile));
router.post('/uploads/trash/delete', authenticateAdmin, asyncHandler(adminController.deleteTrashFile));
// List cleanup runs (audit)
router.get('/cleanup-runs', authenticateAdmin, asyncHandler(adminController.listCleanupRuns));

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








