// backend/server/routes/rolRoutes.js
const express = require('express');
const RolController = require('../Controllers/RolController');
const { authenticate, isAdmin } = require('../Middlewares/authMiddlewares');
const router = express.Router();

// Rutas para Roles
// POST /api/roles - Crear un nuevo rol
router.post('/', authenticate, isAdmin, RolController.createRol);

// GET /api/roles/:id - Obtener un rol por ID
router.get('/:id', authenticate, isAdmin, RolController.getRolById);

// GET /api/roles - Obtener todos los roles
router.get('/', authenticate, isAdmin, RolController.getAllRoles);

// PUT /api/roles/:id - Actualizar un rol
router.put('/:id', authenticate, isAdmin, RolController.updateRol);

// DELETE /api/roles/:id - Desactivar (eliminar lógicamente) un rol
router.delete('/:id', authenticate, isAdmin, RolController.deleteRol);

module.exports = router;