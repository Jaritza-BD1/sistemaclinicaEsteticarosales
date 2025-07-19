// backend/server/routes/userRoutes.js (o donde manejes las rutas de usuario autenticado)
const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController'); // Asegúrate de la ruta correcta
const { verifyToken } = require('../Middlewares/authMiddleware'); // O tu middleware de autenticación

// Ruta para actualizar el perfil del usuario (protegida)
router.put('/profile', verifyToken, userController.updateProfile);

module.exports = router;