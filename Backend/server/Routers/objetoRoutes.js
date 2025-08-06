// backend/server/routes/objetoRoutes.js
const express = require('express');
const ObjetoController = require('../Controllers/ObjetoController');
const { authenticate, isAdmin } = require('../Middlewares/authMiddlewares');
const router = express.Router();

// Rutas para Objetos
// POST /api/objetos - Crear un nuevo objeto
router.post('/', authenticate, isAdmin, ObjetoController.createObjeto);

// GET /api/objetos/:id - Obtener un objeto por ID
router.get('/:id', authenticate, isAdmin, ObjetoController.getObjetoById);

// GET /api/objetos - Obtener todos los objetos (con filtros opcionales)
router.get('/', authenticate, isAdmin, ObjetoController.getAllObjetos);

// PUT /api/objetos/:id - Actualizar un objeto
router.put('/:id', authenticate, isAdmin, ObjetoController.updateObjeto);

// DELETE /api/objetos/:id - Desactivar (eliminar lógicamente) un objeto
router.delete('/:id', authenticate, isAdmin, ObjetoController.deleteObjeto);

module.exports = router;