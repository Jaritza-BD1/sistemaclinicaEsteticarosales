// routes/auth.js
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticate } = require('../Middlewares/authMiddlewares');
const auth = require('../Controllers/authControllers');
const twoFAController = require('../Controllers/twoFactorController');


const router = express.Router();

// Helper para formatear errores de express-validator
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Formatear errores para que coincida con lo que espera el frontend
    const errorMessages = errors.array().map(e => e.msg).join('. ');
    return res.status(400).json({
      error: errorMessages
    });
  }
  next();
}

// — Registro —
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 4, max: 15 }).withMessage('Usuario entre 4 y 15 caracteres')
      .matches(/^[A-Z0-9]+$/).withMessage('Solo mayúsculas y números'),
    body('name').trim().notEmpty().withMessage('Nombre requerido'),
    body('email').trim().isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
      .matches(/[a-z]/).withMessage('Debe contener minúscula')
      .matches(/[A-Z]/).withMessage('Debe contener mayúscula')
      .matches(/\d/).withMessage('Debe contener número')
      .matches(/[!@#$%^&*]/).withMessage('Debe contener carácter especial'),
    body('confirmPassword')
      .custom((confirm, { req }) => confirm === req.body.password)
      .withMessage('Las contraseñas no coinciden')
  ],
  validateRequest,
  auth.register
);

// — Verificación de email —
router.get(
  '/verify-email',
  [
    query('token').notEmpty().withMessage('Token de verificación requerido')
  ],
  validateRequest,
  auth.verifyEmail
);

// — Login —
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Usuario requerido'),
    body('password').notEmpty().withMessage('Contraseña requerida')
  ],
  validateRequest,
  auth.login
);

// — Primer cambio de contraseña —
router.post(
  '/change-password',
  authenticate,
  [
    body('newPassword').notEmpty().withMessage('Nueva contraseña requerida'),
    body('confirmPassword').notEmpty().withMessage('Confirmación requerida')
  ],
  validateRequest,
  auth.changePassword
);

// — Olvidé mi contraseña —
router.post(
  '/forgot-password',
  [
    body('email').trim().isEmail().withMessage('Email inválido'),
    body('smtpEmail').optional().isEmail().withMessage('SMTP Email inválido'),
    body('smtpPass').optional().notEmpty().withMessage('SMTP Password requerido')
  ],
  validateRequest,
  auth.forgotPassword
);

// — Restablecer contraseña —
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token requerido'),
    body('newPassword').notEmpty().withMessage('Nueva contraseña requerida'),
    body('confirmPassword').notEmpty().withMessage('Confirmación requerida')
  ],
  validateRequest,
  auth.resetPassword
);

// — Perfil de usuario —
router.get(
  '/profile',
  authenticate,
  auth.getUserProfile
);

// — Verificar token JWT —
router.get(
  '/verify-token',
  authenticate,
  (req, res) => res.json({ valid: true, user: req.user })
);

// Rutas de 2FA (requieren autenticación)
router.get('/2fa/setup', authenticate, twoFAController.generate2FASecret);
router.post('/2fa/verify', authenticate, twoFAController.verify2FAToken);
router.delete('/2fa/disable', authenticate, twoFAController.disable2FA);
router.get('/2fa/new-backup-codes', authenticate, twoFAController.generateNewBackupCodes);

// Ruta de verificación durante login (no requiere autenticación previa)
router.post(
  '/2fa/verify-login',
  [
    body('userId').isInt({ min: 1 }).withMessage('ID de usuario requerido y debe ser entero'),
    body('token').notEmpty().withMessage('Token requerido')
  ],
  validateRequest,
  twoFAController.verifyLogin2FA
);

// Ruta para reenviar código 2FA por email (no requiere autenticación previa)
router.post(
  '/2fa/resend-code',
  [
    body('userId').isInt({ min: 1 }).withMessage('ID de usuario requerido y debe ser entero')
  ],
  validateRequest,
  twoFAController.resend2FACode
);

// Ruta para verificar código 2FA enviado por email (no requiere autenticación previa)
router.post(
  '/2fa/verify-email-code',
  [
    body('userId').isInt({ min: 1 }).withMessage('ID de usuario requerido y debe ser entero'),
    body('token').notEmpty().withMessage('Token requerido')
  ],
  validateRequest,
  twoFAController.verifyEmail2FACode
);


module.exports = router;






