// backend/server/routes/permisoRoutes.js
const express = require('express');
const PermisoController = require('../Controllers/PermisoController');
const { authenticate, isAdmin } = require('../Middlewares/authMiddlewares');
const router = express.Router();

// Rutas para Permisos
// POST /api/permisos/upsert - Asigna o actualiza los permisos de un rol para un objeto
router.post('/upsert', authenticate, isAdmin, PermisoController.upsertPermiso);

// GET /api/permisos/:idRol/:idObjeto - Obtener los permisos de un rol para un objeto específico
router.get('/:idRol/:idObjeto', authenticate, isAdmin, PermisoController.getPermisoByRolAndObjeto);

// GET /api/permisos/rol/:idRol - Obtener todos los permisos para un rol específico
router.get('/rol/:idRol', authenticate, isAdmin, PermisoController.getPermisosByRol);

// GET /api/permisos - Obtener todos los permisos (con filtros opcionales)
router.get('/', authenticate, isAdmin, PermisoController.getAllPermisos);

// DELETE /api/permisos/:idRol/:idObjeto - Desactivar un permiso específico
router.delete('/:idRol/:idObjeto', authenticate, isAdmin, PermisoController.deactivatePermiso);

module.exports = router;