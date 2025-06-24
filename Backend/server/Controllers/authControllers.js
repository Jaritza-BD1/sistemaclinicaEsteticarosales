const { Sequelize } = require('sequelize');
const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Parametro = require('../Models/Parametro');
const { sendResetEmail } = require('../utils/mailer');
const { generateTempPassword } = require('../utils/passwordGenerator');

// Configuración de transporte para emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 3;
const LOCK_TIME = parseInt(process.env.LOCK_TIME) || 30 * 60 * 1000; // 30 minutos

const register = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    
    // Validar que todos los campos estén presentes
    if (!username || !name || !email || !password) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios' 
      });
    }

    // Validar formato de usuario (solo mayúsculas y números)
    if (!/^[A-Z0-9]+$/.test(username)) {
      return res.status(400).json({
        error: 'El usuario solo debe contener mayúsculas y números'
      });
    }

    // Validar formato de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'
      });
    }

    // Verificar si usuario existe
    const existingUser = await User.findOne({
      where: {
        [Sequelize.Op.or]: [
          { username: username.toUpperCase() },
          { email: email.toLowerCase() }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'El nombre de usuario o correo ya están registrados' 
      });
    }

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    const user = await User.create({ 
      username: username.toUpperCase(),
      name,
      email: email.toLowerCase(),
      password,
      status: 'Pendiente Verificación',
      verificationToken,
      tokenExpiry,
      firstLogin: true
    });
    
    // Enviar email de verificación
    const verificationUrl = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;
    
    const mailOptions = {
      from: `"Clínica Estética Rosales" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verificación de Cuenta',
      html: `
        <h2>¡Gracias por registrarte!</h2>
        <p>Por favor verifica tu cuenta haciendo clic en el siguiente enlace:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>Este enlace expirará en 24 horas.</p>
        <p>Después de la verificación, tu cuenta quedará pendiente de aprobación por un administrador.</p>
      `
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Error enviando email de verificación:', error);
      }
    });

    res.status(201).json({ 
      message: 'Registro exitoso. Por favor verifica tu email.' 
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor durante el registro' });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  
  if (!token) {
    return res.status(400).json({ 
      error: 'Token de verificación requerido' 
    });
  }
  
  try {
    const user = await User.findOne({
      where: {
        verificationToken: token,
        tokenExpiry: { [Sequelize.Op.gt]: new Date() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ 
        error: 'Token inválido o expirado' 
      });
    }
    
    // Actualizar estado del usuario
    await user.update({
      status: 'Pendiente Aprobación',
      verificationToken: null,
      tokenExpiry: null
    });
    
    res.json({ 
      message: 'Email verificado. Tu cuenta está pendiente de aprobación.' 
    });
  } catch (error) {
    console.error('Error en verificación de email:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const uppercaseUsername = username.toUpperCase();
    
    // 1. Buscar usuario
    const user = await User.findOne({ 
      where: { username: uppercaseUsername } 
    });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        attemptsLeft: MAX_LOGIN_ATTEMPTS - 1
      });
    }

    // 2. Verificar estado de cuenta
    if (user.status === 'Pendiente Verificación') {
      return res.status(403).json({ 
        error: 'Verifica tu email primero' 
      });
    }
    
    if (user.status === 'Pendiente Aprobación') {
      return res.status(403).json({ 
        error: 'Cuenta pendiente de aprobación' 
      });
    }
    
    if (user.status === 'Bloqueado') {
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return res.status(403).json({ 
          error: `Cuenta bloqueada temporalmente. Intente nuevamente después de ${user.lockedUntil.toLocaleTimeString()}`,
          lockedUntil: user.lockedUntil
        });
      }
      // Desbloquear si ya pasó el tiempo
      user.status = 'Activo';
      user.failedAttempts = 0;
      user.lockedUntil = null;
      await user.save();
    }

    if (user.status !== 'Activo') {
      return res.status(403).json({ 
        error: 'Su cuenta no está activa. Contacte al administrador.' 
      });
    }

    // 3. Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      // Incrementar intentos fallidos
      const newAttempts = user.failedAttempts + 1;
      await user.update({ failedAttempts: newAttempts });
      
      // Bloquear cuenta si supera el límite
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        await user.update({ 
          status: 'Bloqueado',
          lockedUntil: new Date(Date.now() + LOCK_TIME)
        });
        
        return res.status(403).json({ 
          error: `Cuenta bloqueada por superar ${MAX_LOGIN_ATTEMPTS} intentos fallidos`,
          lockedUntil: new Date(Date.now() + LOCK_TIME)
        });
      }
      
      const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
      return res.status(401).json({ 
        error: `Credenciales inválidas. Intentos restantes: ${remaining}`,
        attemptsLeft: remaining
      });
    }

    // 4. Login exitoso (resetear intentos)
    await user.update({ 
      failedAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date()
    });

    // Generar token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { 
      expiresIn: '24h' 
    });

    // Omitir password en la respuesta
    const userResponse = user.toJSON();
    delete userResponse.password;

    // Manejar primer ingreso
    if (user.firstLogin) {
      return res.json({ 
        token, 
        user: userResponse,
        firstLogin: true,
        message: 'Primer ingreso. Debes cambiar tu contraseña.' 
      });
    }

    res.json({ 
      token, 
      user: userResponse,
      message: 'Inicio de sesión exitoso' 
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor durante el login' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const userId = req.userId; // Obtener del middleware de autenticación
    
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        error: 'Las contraseñas no coinciden' 
      });
    }
    
    // Validar formato de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error: 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'
      });
    }

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }
    
    // Actualizar contraseña
    user.password = newPassword;
    user.firstLogin = false;
    await user.save();
    
    res.json({ 
      message: 'Contraseña actualizada exitosamente' 
    });
    
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email, smtpEmail, smtpPass } = req.body;

  try {
    // 1) Localizar usuario por correo
    const user = await User.findOne({ 
      where: { atr_correo_electronico: email.toLowerCase() } 
    });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // 2) Si vienen credenciales SMTP dinámicas -> flujo de contraseña temporal
    if (smtpEmail && smtpPass) {
      // Generar y hashear contraseña temporal
      const tempPassword = generateTempPassword();
      const param = await Parametro.findOne({
        where: { atr_parametro: 'RESET_TOKEN_EXPIRY' }
      });
      const expiryHours = param ? parseInt(param.atr_valor, 10) : 24;
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
      const hashedPwd = await bcrypt.hash(tempPassword, saltRounds);

      // Guardar en la BD
      user.atr_contrasena   = hashedPwd;
      user.atr_reset_expiry = new Date(Date.now() + expiryHours * 3600 * 1000);
      await user.save();

      // Enviar el correo usando las credenciales proporcionadas
      await sendResetEmail(
        user.atr_correo_electronico,
        tempPassword,
        expiryHours,
        smtpEmail,
        smtpPass
      );

      return res.json({ message: 'Correo con contraseña temporal enviado correctamente.' });
    }

    // 3) Si no hay SMTP dinámico -> flujo de enlace de reset
    const resetToken  = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600 * 1000); // 1 hora

    await user.update({
      atr_reset_token: resetToken,
      atr_reset_expiry: resetExpiry
    });

    // Preparar y enviar el email con el enlace de recuperación
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: `"Clínica Estética Rosales" <${process.env.EMAIL_USER}>`,
      to: user.atr_correo_electronico,
      subject: 'Recuperación de Contraseña',
      html: `
        <h2>Solicitud de recuperación de contraseña</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, ignora este mensaje.</p>
      `
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Error enviando email de recuperación:', error);
        return res.status(500).json({ message: 'Error enviando email de recuperación' });
      }
      return res.json({ message: 'Correo de recuperación enviado correctamente.' });
    });

  } catch (err) {
    console.error('Error en forgotPassword:', err);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;
  
  try {
    // Validar token y tiempo
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetExpiry: { [Sequelize.Op.gt]: new Date() }
      }
    });
    
    if (!user) {
      return res.status(400).json({ 
        error: 'Token inválido o expirado' 
      });
    }
    
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        error: 'Las contraseñas no coinciden' 
      });
    }
    
    // Validar formato de contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error: 'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.resetToken = null;
    user.resetExpiry = null;
    await user.save();
    
    res.json({ 
      message: 'Contraseña restablecida exitosamente' 
    });
    
  } catch (error) {
    console.error('Error restableciendo contraseña:', error);
    res.status(500).json({ 
      error: 'Error en el servidor' 
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    // El middleware de autenticación ya adjuntó el usuario a req.user
    const user = req.user;
    
    // Omitir información sensible
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.failedAttempts;
    delete userResponse.lockedUntil;
    delete userResponse.verificationToken;
    delete userResponse.tokenExpiry;
    delete userResponse.resetToken;
    delete userResponse.resetExpiry;

    res.json(userResponse);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error obteniendo perfil de usuario' });
  }
};

module.exports = { 
  register, 
  verifyEmail,
  login, 
  changePassword,
  forgotPassword,
  resetPassword,
  getUserProfile 
};