const express = require('express');
const router = express.Router();
const { 
  register, 
  verifyEmail,
  login, 
  changePassword,
  forgotPassword,
  resetPassword,
  getUserProfile,
  getPendingUsers,
  approveUser
} = require('../Controllers/authControllers');
const { authenticate, isAdmin } = require('../Middlewares/authMiddlewares');

// Ruta de registro
router.post('/register', register);

// Ruta de verificación de email
router.get('/verify', verifyEmail);

// Ruta de login
router.post('/login', login);

// Ruta para cambio de contraseña (primer ingreso)
router.post('/change-password', authenticate, changePassword);

// Ruta para recuperación de contraseña
router.post('/forgot-password', forgotPassword);

// Ruta para restablecer contraseña
router.post('/reset-password', resetPassword);

// Ruta de perfil (protegida)
router.get('/profile', authenticate, getUserProfile);

// Ruta para verificar token (usada al cargar la app)
router.get('/verify-token', authenticate, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ======== Rutas de administración ======== //

// Obtener usuarios pendientes de aprobación
router.get('/admin/pending-users', authenticate, isAdmin, getPendingUsers);

// Aprobar un usuario
router.post('/admin/approve-user/:id', authenticate, isAdmin, approveUser);

module.exports = router;