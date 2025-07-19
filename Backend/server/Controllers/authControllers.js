// Controllers/authControllers.js

const { Sequelize, Op } = require('sequelize');
const User = require('../Models/User');
const Parametro = require('../Models/Parametro');
const HistContrasena = require('../Models/PasswordHistory');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { sendResetEmail, sendVerificationEmail, sendPasswordChangeEmail } = require('../utils/mailer');
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

    const verificationToken = generateToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      atr_usuario: usuario,
      atr_nombre_usuario: name,
      atr_correo_electronico: email.toLowerCase(),
      atr_contrasena: hashedPassword,
      atr_estado_usuario: 'PENDIENTE_VERIFICACION',
      atr_verification_token: verificationToken,
      atr_token_expiry: tokenExpiry,
      atr_primer_ingreso: true
    });

    await sendVerificationEmail(
      user.atr_correo_electronico, 
      verificationToken,
      user.atr_nombre_usuario
    );

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
      atr_token_expiry: null
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/email-verified?success=true`);
    
  } catch (error) {
    console.error('Error en verificación de email:', error);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/email-verified?success=false&error=${encodeURIComponent(error.message)}`);
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
      const response = { twoFARequired: true, userId: user.atr_id_usuario };
      console.log('Login: Sending response:', response);
      console.log('Login: Response type check - userId type:', typeof user.atr_id_usuario);
      return res.json(response);
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

    const resetToken = generateToken();
    const resetExpiry = new Date(Date.now() + 3600 * 1000);

    await user.update({
      atr_reset_token: resetToken,
      atr_reset_expiry: resetExpiry
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: `"Clínica Estética Rosales" <${process.env.EMAIL_USER}>`,
      to: user.atr_correo_electronico,
      subject: 'Recuperación de Contraseña',
      html: `<p>Haz clic aquí para restablecer tu contraseña: <a href="${resetUrl}">${resetUrl}</a></p>`
    });

    res.json({ message: 'Correo de recuperación enviado correctamente.' });
  } catch (err) {
    console.error('Error en forgotPassword:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
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

    await user.update({
      atr_contrasena: hashedNew,
      atr_reset_token: null,
      atr_reset_expiry: null
    });
    
    await HistContrasena.create({
      atr_id_usuario: user.atr_id_usuario,
      atr_contrasena: hashedNew
    });

    await sendPasswordChangeEmail(user.atr_correo_electronico, user.atr_nombre_usuario);

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
