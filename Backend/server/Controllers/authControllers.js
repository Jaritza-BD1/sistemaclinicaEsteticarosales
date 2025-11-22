// Controllers/authControllers.js

const { Sequelize, Op } = require('sequelize');
const User = require('../Models/User');
const Token = require('../Models/tokenmodel');
const Parametro = require('../Models/Parametro');
const HistContrasena = require('../Models/PasswordHistory');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OTP } = require('../Config/security');
const { send2FAEmailCode, sendResetEmail, sendVerificationEmail, sendPasswordChangeEmail, sendVerificationCodeEmail, sendPasswordResetCodeEmail } = require('../utils/mailer');
const { generateTempPassword, generateToken } = require('../helpers/tokenHelper');
const BitacoraService = require('../services/bitacoraService');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Helper para envío de email de aprobación
const sendApprovalEmail = async (email) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const loginUrl = `${frontendUrl}/login`;
  await transporter.sendMail({
    from: `"Clínica Estética Rosales" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Cuenta Aprobada',
    html: `
      <h2>¡Tu cuenta ha sido aprobada!</h2>
      <p>Ahora puedes iniciar sesión aquí:</p>
      <a href="${loginUrl}">${loginUrl}</a>
    `
  });
};

exports.register = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    const usuario = username.toUpperCase();
    
    if (!username || !name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial' 
      });
    }

    const exists = await User.findOne({
      where: {
        [Op.or]: [
          { atr_usuario: usuario },
          { atr_correo_electronico: email.toLowerCase() }
        ]
      }
    });
    if (exists) {
      return res.status(400).json({ error: 'Usuario o correo ya registrados' });
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Generar código OTP de 6 dígitos para verificación por email
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Si el frontend envía dos_fa_enabled, mapearlo a atr_2fa_enabled
    const atr2faFromBody = req.body?.dos_fa_enabled !== undefined
      ? Boolean(req.body.dos_fa_enabled)
      : (req.body?.atr_2fa_enabled !== undefined ? Boolean(req.body.atr_2fa_enabled) : false);

    const user = await User.create({
      atr_usuario: usuario,
      atr_nombre_usuario: name,
      atr_correo_electronico: email.toLowerCase(),
      atr_contrasena: hashedPassword,
      atr_estado_usuario: 'PENDIENTE_VERIFICACION',
      atr_verification_token: verificationToken,
      atr_token_expiry: tokenExpiry,
      atr_primer_ingreso: true,
      atr_2fa_enabled: atr2faFromBody
    });

    // Enviar código OTP por email en lugar de enlace
    try {
      await sendVerificationCodeEmail(
        user.atr_correo_electronico,
        verificationToken,
        user.atr_nombre_usuario || user.atr_usuario
      );
    } catch (mailErr) {
      console.error('Error enviando código de verificación por email:', mailErr);
      // No bloquear el registro si falla el envío, pero dejar aviso en logs
    }

    res.status(201).json({ message: 'Registro exitoso. Revisa tu email para verificar tu cuenta.' });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor durante el registro' });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).json({ error: 'Token de verificación requerido' });
  }

  try {
    const user = await User.findOne({
      where: {
        atr_verification_token: token,
        atr_token_expiry: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    await user.update({
      atr_is_verified: true,
      atr_verification_token: null,
      atr_token_expiry: null,
      atr_estado_usuario: 'PENDIENTE_APROBACION'
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/email-verified?success=true`);
    
  } catch (error) {
    console.error('Error en verificación de email:', error);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/email-verified?success=false&error=${encodeURIComponent(error.message)}`);
  }
};

exports.verifyEmailPost = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token de verificación requerido' });
  }
  try {
    const user = await User.findOne({
      where: {
        atr_verification_token: token,
        atr_token_expiry: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    await user.update({
      atr_is_verified: true,
      atr_verification_token: null,
      atr_token_expiry: null,
      atr_estado_usuario: 'PENDIENTE_APROBACION'
    });

    return res.json({ message: '¡Correo verificado! Espera la aprobación del administrador.' });
  } catch (error) {
    console.error('Error en verificación de email (POST):', error);
    return res.status(500).json({ error: 'Error en el servidor durante la verificación.' });
  }
};

// Reenviar código de verificación por email (para registro)
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email es requerido' });

    const user = await User.findOne({ where: { atr_correo_electronico: email.toLowerCase() } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (user.atr_estado_usuario !== 'PENDIENTE_VERIFICACION') {
      return res.status(400).json({ error: 'El usuario no está pendiente de verificación' });
    }

    // Generar nuevo código de 6 dígitos
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.update({ atr_verification_token: newCode, atr_token_expiry: expiry });

    try {
      await sendVerificationCodeEmail(user.atr_correo_electronico, newCode, user.atr_nombre_usuario || user.atr_usuario);
    } catch (mailErr) {
      console.error('Error reenvío código verificación:', mailErr);
      return res.status(500).json({ error: 'Error enviando el código por email' });
    }

    return res.json({ message: 'Código de verificación reenviado' });
  } catch (error) {
    console.error('Error en resendVerification:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const uname = username.toUpperCase();
    const user = await User.findOne({ where: { atr_usuario: uname } });
    
    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    const maxAttemptsParam = await Parametro.findOne({ 
      where: { atr_parametro: 'ADMIN_INTENTOS_INVALIDOS' } 
    });
    const MAX_LOGIN_ATTEMPTS = maxAttemptsParam 
      ? parseInt(maxAttemptsParam.atr_valor, 10) 
      : 3;
    
    const LOCK_TIME = 30 * 60 * 1000;

    const status = user.atr_estado_usuario;
    if (status === 'PENDIENTE_VERIFICACION') {
      return res.status(403).json({ error: 'Verifica tu email primero' });
    }
    if (status === 'PENDIENTE_APROBACION') {
      return res.status(403).json({ error: 'Cuenta pendiente de aprobación' });
    }
    if (status === 'BLOQUEADO') {
      if (user.atr_reset_expiry && user.atr_reset_expiry > new Date()) {
        return res.status(403).json({
          error: `Cuenta bloqueada hasta ${user.atr_reset_expiry.toLocaleTimeString()}`
        });
      }
      await user.update({
        atr_estado_usuario: 'ACTIVO',
        atr_intentos_fallidos: 0,
        atr_reset_expiry: null
      });
    }
    if (user.atr_estado_usuario !== 'ACTIVO') {
      return res.status(403).json({ error: 'Cuenta no activa' });
    }

    const match = await bcrypt.compare(password, user.atr_contrasena);
    if (!match) {
      const attempts = user.atr_intentos_fallidos + 1;
      await user.update({ atr_intentos_fallidos: attempts });
      
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        await user.update({
          atr_estado_usuario: 'BLOQUEADO',
          atr_reset_expiry: new Date(Date.now() + LOCK_TIME)
        });
        return res.status(403).json({
          error: `Cuenta bloqueada tras ${MAX_LOGIN_ATTEMPTS} intentos fallidos`
        });
      }
      
      return res.status(401).json({
        error: `Credenciales inválidas. Restan ${MAX_LOGIN_ATTEMPTS - attempts} intentos`
      });
    }

    await user.update({
      atr_intentos_fallidos: 0,
      atr_reset_expiry: null,
      atr_fecha_ultima_conexion: new Date()
    });

    if (user.atr_primer_ingreso) {
      const resetToken = generateToken();
      await user.update({ 
        atr_reset_token: resetToken,
        atr_reset_expiry: new Date(Date.now() + 3600000)
      });
      return res.json({ firstLogin: true, resetToken });
    }

if (user.atr_2fa_enabled) {
  console.log('Login: 2FA required for user:', { 
    userId: user.atr_id_usuario, 
    username: user.atr_usuario 
  });

  try {
    // 1. Invalidar cualquier código OTP previo no utilizado
    await Token.update(
      { 
        atr_utilizado: true,
        atr_fecha_modificacion: new Date(),
        atr_modificado_por: 'SISTEMA'
      },
      { 
        where: { 
          atr_id_usuario: user.atr_id_usuario,
          atr_tipo: 'LOGIN_OTP',
          atr_utilizado: false
        } 
      }
    );

    // 2. Verificar límite de intentos recientes
    const recentAttempts = await Token.count({
      where: {
        atr_id_usuario: user.atr_id_usuario,
        atr_tipo: 'LOGIN_OTP',
        atr_fecha_creacion: { 
          [Op.gt]: new Date(Date.now() - 15 * 60 * 1000) // Últimos 15 minutos
        }
      }
    });

    if (recentAttempts >= 3) {
      return res.status(429).json({ 
        error: 'Demasiados intentos. Por favor, espera 15 minutos antes de solicitar un nuevo código.' 
      });
    }

    // 3. Generar nuevo código OTP
    const otpCode = Token.generateOTP();
    const expirationTime = Token.generateExpirationDate(10); // 10 minutos

    // 4. Guardar el nuevo token
    await Token.create({
      atr_id_usuario: user.atr_id_usuario,
      atr_codigo: otpCode,
      atr_tipo: 'LOGIN_OTP',
      atr_fecha_expiracion: expirationTime,
      atr_creado_por: 'SISTEMA'
    });

    // 5. Enviar el código por correo
    try {
      await send2FAEmailCode(
        user.atr_correo_electronico,
        otpCode,
        user.atr_nombre_usuario || user.atr_usuario
      );
      console.log('Código 2FA generado y enviado para el usuario:', user.atr_usuario);
    } catch (emailError) {
      console.error('Error al enviar correo 2FA:', emailError);
      return res.status(500).json({ 
        error: 'Error al enviar el código de verificación. Por favor, inténtalo de nuevo.' 
      });
    }
    
    const response = { 
      success: true,
      twoFARequired: true, 
      userId: user.atr_id_usuario,
      message: 'Se ha enviado un código de verificación a tu correo electrónico'
    };
    
    console.log('Login: 2FA iniciado exitosamente para usuario:', user.atr_usuario);
    return res.json(response);
    
  } catch (error) {
    console.error('Error en proceso 2FA:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error en el proceso de autenticación de dos factores' 
    });
  }
}

    const token = jwt.sign(
      { 
        id: user.atr_id_usuario, 
        role: user.atr_id_rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const safe = user.toJSON();
    delete safe.atr_contrasena;
    delete safe.atr_intentos_fallidos;
    delete safe.atr_reset_token;
    delete safe.atr_reset_expiry;
    // Registrar en bitácora el ingreso exitoso
    await BitacoraService.registrarEvento({
      atr_id_usuario: user.atr_id_usuario,
      atr_id_objetos: 1, // ID del objeto/pantalla de login
      atr_accion: 'Ingreso',
      atr_descripcion: 'Inicio de sesión exitoso',
      ip_origen: req.ip
    });
    res.json({ token, user: safe, message: 'Inicio de sesión exitoso' });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor durante el login' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    const userId = req.user?.atr_id_usuario;
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial' 
      });
    }
    
    let user;
    if (userId) {
      user = await User.findByPk(userId);
    } else {
      user = await User.findOne({ 
        where: { 
          atr_reset_token: token,
          atr_reset_expiry: { [Op.gt]: new Date() }
        } 
      });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado o token inválido' });
    }
    
    const passwordHistory = await HistContrasena.findAll({
      where: { atr_id_usuario: user.atr_id_usuario },
      order: [['atr_fecha_creacion', 'DESC']],
      limit: 5
    });
    
    for (const oldPassword of passwordHistory) {
      const isSame = await bcrypt.compare(newPassword, oldPassword.atr_contrasena);
      if (isSame) {
        return res.status(400).json({ 
          error: 'No puedes reutilizar contraseñas anteriores' 
        });
      }
    }
    
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const hashedNew = await bcrypt.hash(newPassword, saltRounds);

    await user.update({
      atr_contrasena: hashedNew,
      atr_primer_ingreso: false,
      atr_reset_token: null,
      atr_reset_expiry: null
    });
    
    await HistContrasena.create({
      atr_id_usuario: user.atr_id_usuario,
      atr_contrasena: hashedNew
    });

    await sendPasswordChangeEmail(user.atr_correo_electronico, user.atr_nombre_usuario);
    // Registrar en bitácora el cambio de contraseña
    try {
      await BitacoraService.registrarEvento({
        atr_id_usuario: user.atr_id_usuario,
        atr_id_objetos: 1,
        atr_accion: 'Cambio contraseña',
        atr_descripcion: 'Cambio de contraseña por el propio usuario',
        ip_origen: req.ip
      });
    } catch (e) {
      console.error('Error registrando evento de bitácora (changePassword):', e);
    }

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error en el servidor durante el cambio de contraseña' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email, smtpEmail, smtpPass } = req.body;
  try {
    const user = await User.findOne({
      where: { atr_correo_electronico: email.toLowerCase() }
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    if (smtpEmail && smtpPass) {
      const tempPwd = generateTempPassword();
      const param = await Parametro.findOne({
        where: { atr_parametro: 'RESET_TOKEN_EXPIRY' }
      });
      const hrs = param ? parseInt(param.atr_valor, 10) : 24;
      const hashed = await bcrypt.hash(tempPwd, parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10);

      await user.update({
        atr_contrasena: hashed,
        atr_reset_expiry: new Date(Date.now() + hrs * 3600 * 1000)
      });

      await sendResetEmail(
        user.atr_correo_electronico,
        tempPwd,
        hrs,
        smtpEmail,
        smtpPass
      );
      return res.json({ message: 'Correo con contraseña temporal enviado correctamente.' });
    }
    // Control de reintentos: limitar solicitudes de OTP por usuario en ventana
    const recentAttempts = await Token.count({
      where: {
        atr_id_usuario: user.atr_id_usuario,
        atr_tipo: 'PASSWORD_RESET_OTP',
        atr_fecha_creacion: { [Op.gt]: new Date(Date.now() - 15 * 60 * 1000) } // últimos 15 minutos
      }
    });

    if (recentAttempts >= 3) {
      return res.status(429).json({ error: 'Demasiadas solicitudes. Por favor espera 15 minutos antes de solicitar otro código.' });
    }

    // Nuevo flujo: generar OTP de 6 dígitos y guardarlo en la tabla de tokens
    const otpCode = Token.generateOTP();
    const expiration = Token.generateExpirationDate(10); // 10 minutos

    // Invalidar OTPs anteriores del mismo tipo
    await Token.update({ atr_utilizado: true }, {
      where: {
        atr_id_usuario: user.atr_id_usuario,
        atr_tipo: 'PASSWORD_RESET_OTP',
        atr_utilizado: false
      }
    });

    // Crear nuevo token OTP para restablecimiento de contraseña
    await Token.create({
      atr_id_usuario: user.atr_id_usuario,
      atr_codigo: otpCode,
      atr_tipo: 'PASSWORD_RESET_OTP',
      atr_fecha_expiracion: expiration,
      atr_creado_por: 'SISTEMA'
    });

    // Enviar OTP por email (plantilla específica de restablecimiento)
    try {
      await sendPasswordResetCodeEmail(user.atr_correo_electronico, otpCode, user.atr_nombre_usuario || user.atr_usuario);
    } catch (mailErr) {
      console.error('Error enviando OTP de recuperación por email:', mailErr);
      return res.status(500).json({ error: 'Error enviando el código por email' });
    }

    return res.json({ message: 'Código OTP enviado a tu correo. Ingresa el código para continuar.' });
  } catch (err) {
    console.error('Error en forgotPassword:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Verificar OTP de restablecimiento y emitir token temporal para cambiar contraseña
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) return res.status(400).json({ error: 'Email y código son requeridos' });

    const user = await User.findOne({ where: { atr_correo_electronico: email.toLowerCase() } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Buscar token válido
    const t = await Token.findOne({
      where: {
        atr_id_usuario: user.atr_id_usuario,
        atr_codigo: token,
        atr_tipo: 'PASSWORD_RESET_OTP',
        atr_utilizado: false,
        atr_fecha_expiracion: { [Op.gt]: new Date() }
      }
    });

    if (!t) return res.status(400).json({ error: 'Código inválido o expirado' });

    // Marcar token como utilizado
    await t.update({ atr_utilizado: true, atr_modificado_por: 'SISTEMA', atr_fecha_modificacion: new Date() });

    // Generar reset token clásico y guardarlo en user
    const resetToken = generateToken();
    const resetExpiry = new Date(Date.now() + 3600 * 1000); // 1 hora
    await user.update({ atr_reset_token: resetToken, atr_reset_expiry: resetExpiry });

    return res.json({ message: 'Código validado', resetToken });
  } catch (error) {
    console.error('Error en verifyResetOTP:', error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;
  try {
    const user = await User.findOne({
      where: {
        atr_reset_token: token,
        atr_reset_expiry: { [Op.gt]: new Date() }
      }
    });
    if (!user) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial' 
      });
    }
    
    const passwordHistory = await HistContrasena.findAll({
      where: { atr_id_usuario: user.atr_id_usuario },
      order: [['atr_fecha_creacion', 'DESC']],
      limit: 5
    });
    
    for (const oldPassword of passwordHistory) {
      const isSame = await bcrypt.compare(newPassword, oldPassword.atr_contrasena);
      if (isSame) {
        return res.status(400).json({ 
          error: 'No puedes reutilizar contraseñas anteriores' 
        });
      }
    }
    
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
    const hashedNew = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña; limpiar flags de primer ingreso y de intentos fallidos
    await user.update({
      atr_contrasena: hashedNew,
      atr_reset_token: null,
      atr_reset_expiry: null,
      atr_primer_ingreso: false,
      atr_intentos_fallidos: 0
    });
    
    await HistContrasena.create({
      atr_id_usuario: user.atr_id_usuario,
      atr_contrasena: hashedNew
    });

    await sendPasswordChangeEmail(user.atr_correo_electronico, user.atr_nombre_usuario);

    // Registrar en bitácora el restablecimiento de contraseña
    try {
      // atr_accion debe tener como máximo 20 caracteres (según modelo Bitacora)
      await BitacoraService.registrarEvento({
        atr_id_usuario: user.atr_id_usuario,
        atr_id_objetos: 1,
        atr_accion: 'Cambio contraseña',
        atr_descripcion: 'Contraseña restablecida mediante token/OTP',
        ip_origen: req.ip
      });
    } catch (e) {
      console.error('Error registrando evento de bitácora (resetPassword):', e);
    }

    res.json({ message: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    console.error('Error restableciendo contraseña:', error);
    res.status(500).json({ error: 'Error en el servidor durante el restablecimiento' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const safe = req.user.toJSON();
    delete safe.atr_contrasena;
    delete safe.atr_intentos_fallidos;
    delete safe.atr_reset_token;
    delete safe.atr_reset_expiry;
    res.json(safe);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error obteniendo perfil de usuario' });
  }
};

exports.verify2FACode = async (req, res) => {
  try {
    const { userId, code } = req.body;
    
    if (!userId || !code) {
      return res.status(400).json({ error: 'ID de usuario y código son requeridos' });
    }

    // Verificar límite de intentos
    const recentAttempts = await Token.count({
      where: {
        atr_id_usuario: userId,
        atr_tipo: 'LOGIN_OTP',
        atr_fecha_creacion: { 
          [Op.gt]: new Date(Date.now() - OTP.ATTEMPT_WINDOW_MINUTES * 60 * 1000) 
        }
      }
    });

    if (recentAttempts >= OTP.MAX_ATTEMPTS) {
      return res.status(429).json({ 
        success: false,
        error: `Demasiados intentos. Por favor, espera ${OTP.ATTEMPT_WINDOW_MINUTES} minutos.` 
      });
    }

    // Buscar el token válido
    const token = await Token.findOne({
      where: {
        atr_id_usuario: userId,
        atr_codigo: code,
        atr_tipo: 'LOGIN_OTP',
        atr_utilizado: false,
        atr_fecha_expiracion: { [Op.gt]: new Date() }
      }
    });

    if (!token) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }

    // Marcar el token como utilizado
    await token.update({ 
      atr_utilizado: true,
      atr_fecha_modificacion: new Date(),
      atr_modificado_por: 'SISTEMA'
    });

    // Obtener el usuario
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generar token de autenticación
    const authToken = jwt.sign(
      { 
        id: user.atr_id_usuario, 
        role: user.atr_id_rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Limpiar datos sensibles
    const safeUser = user.toJSON();
    delete safeUser.atr_contrasena;
    delete safeUser.atr_intentos_fallidos;
    delete safeUser.atr_reset_token;
    delete safeUser.atr_reset_expiry;

    // Registrar en bitácora
    await BitacoraService.registrarEvento({
      atr_id_usuario: user.atr_id_usuario,
      atr_id_objetos: 1, // ID del objeto/pantalla de login
      atr_accion: 'Verificación 2FA',
      atr_descripcion: 'Verificación de dos factores exitosa',
      ip_origen: req.ip
    });

    res.json({ 
      token: authToken, 
      user: safeUser, 
      message: 'Autenticación de dos factores exitosa' 
    });

  } catch (error) {
    console.error('Error en verificación 2FA:', error);
    res.status(500).json({ error: 'Error en la verificación de dos factores' });
  }
};
