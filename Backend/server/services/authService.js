const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../Models/User');
const Parametro = require('../Models/Parametro');
const PasswordHistory = require('../Models/PasswordHistory');
const config = require('../config/environment');
const logger = require('../utils/logger');
const { generateToken } = require('../helpers/tokenHelper');
const { send2FAEmailCode,sendVerificationEmail, sendResetEmail } = require('../utils/mailer');
const Token = require('../Models/tokenmodel');
const { OTP } = require('../Config/security');


class AuthService {
  static async register(userData) {
    const { username, name, email, password } = userData;
    const usuario = username.toUpperCase();
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { atr_usuario: usuario },
          { atr_correo_electronico: email.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      throw new Error('Usuario o correo ya registrados');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

    // Generar token de verificación
    const verificationToken = generateToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Crear usuario
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

    // Enviar email de verificación
    await sendVerificationEmail(
      user.atr_correo_electronico, 
      verificationToken,
      user.atr_nombre_usuario
    );

    logger.auth('Usuario registrado exitosamente', { userId: user.atr_id_usuario });
    
    return {
      message: 'Registro exitoso. Revisa tu email para verificar tu cuenta.',
      userId: user.atr_id_usuario
    };
  }

  /**
   * Genera un código OTP y lo envía al usuario
   * @param {number} userId - ID del usuario
   * @param {string} purpose - Propósito del OTP (ej: 'LOGIN_OTP', 'PASSWORD_RESET_OTP')
   * @returns {Promise<Object>} Información del token generado
   */
  static async generateAndSendOtp(userId, purpose = 'LOGIN_OTP') {
    try {
      // 1. Invalidar cualquier OTP previo no utilizado
      await Token.update(
        { 
          atr_utilizado: true,
          atr_fecha_modificacion: new Date(),
          atr_modificado_por: 'SISTEMA'
        },
        { 
          where: { 
            atr_id_usuario: userId,
            atr_tipo: purpose,
            atr_utilizado: false
          } 
        }
      );

      // 2. Generar nuevo OTP
      const otpCode = Token.generateOTP();
      const expirationTime = Token.generateExpirationDate(OTP.EXPIRATION_MINUTES);

      // 3. Guardar en la base de datos
      const token = await Token.create({
        atr_id_usuario: userId,
        atr_codigo: otpCode,
        atr_tipo: purpose,
        atr_fecha_expiracion: expirationTime,
        atr_creado_por: 'SISTEMA'
      });

      // 4. Obtener información del usuario para el correo
      const user = await User.findByPk(userId, {
        attributes: ['atr_correo_electronico', 'atr_nombre_usuario', 'atr_usuario']
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // 5. Enviar por correo
      await send2FAEmailCode(
        user.atr_correo_electronico,
        otpCode,
        user.atr_nombre_usuario || user.atr_usuario,
        purpose
      );

      logger.info(`OTP generado y enviado para usuario ID: ${userId}, propósito: ${purpose}`);

      return {
        success: true,
        expiresAt: expirationTime,
        purpose,
        message: 'Código de verificación enviado exitosamente'
      };

    } catch (error) {
      logger.error(`Error al generar OTP para usuario ${userId}:`, error);
      throw new Error('Error al generar el código de verificación');
    }
  }

  /**
   * Verifica un código OTP
   * @param {number} userId - ID del usuario
   * @param {string} otpCode - Código OTP a verificar
   * @param {string} purpose - Propósito del OTP (ej: 'LOGIN_OTP', 'PASSWORD_RESET_OTP')
   * @returns {Promise<Object>} Objeto con isValid y opcionalmente un mensaje de error
   */
  static async verifyOtp(userId, otpCode, purpose = 'LOGIN_OTP') {
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Buscar el token no utilizado y no expirado
      const token = await Token.findOne({
        where: {
          atr_id_usuario: userId,
          atr_codigo: otpCode,
          atr_tipo: purpose,
          atr_utilizado: false,
          atr_fecha_expiracion: { [Op.gt]: new Date() }
        },
        transaction
      });

      if (!token) {
        await transaction.rollback();
        return { 
          isValid: false, 
          error: 'Código inválido o expirado' 
        };
      }

      // 2. Marcar el token como utilizado
      await token.update(
        { 
          atr_utilizado: true,
          atr_modificado_por: 'SISTEMA',
          atr_fecha_modificacion: new Date()
        },
        { transaction }
      );

      await transaction.commit();
      
      logger.info(`OTP verificado exitosamente para usuario ID: ${userId}, propósito: ${purpose}`);
      return { isValid: true };

    } catch (error) {
      await transaction.rollback();
      logger.error(`Error al verificar OTP para usuario ${userId}:`, error);
      throw new Error('Error al verificar el código de verificación');
    }
  }

  static async verifyEmail(token) {
    const user = await User.findOne({
      where: {
        atr_verification_token: token,
        atr_token_expiry: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      throw new Error('Token inválido o expirado');
    }

    await user.update({
      atr_is_verified: true,
      atr_verification_token: null,
      atr_token_expiry: null,
      atr_estado_usuario: 'PENDIENTE_APROBACION'
    });

    logger.auth('Email verificado', { userId: user.atr_id_usuario });
    
    return {
      message: 'Email verificado exitosamente',
      userId: user.atr_id_usuario
    };
  }

  static async login(credentials) {
    const { username, password } = credentials;
    const uname = username.toUpperCase();
    
    const user = await User.findOne({ where: { atr_usuario: uname } });
    
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar estado del usuario
    const status = user.atr_estado_usuario;
    if (status === 'PENDIENTE_VERIFICACION') {
      throw new Error('Verifica tu email primero');
    }
    if (status === 'PENDIENTE_APROBACION') {
      throw new Error('Cuenta pendiente de aprobación');
    }
    if (status === 'BLOQUEADO') {
      if (user.atr_reset_expiry && user.atr_reset_expiry > new Date()) {
        throw new Error(`Cuenta bloqueada hasta ${user.atr_reset_expiry.toLocaleTimeString()}`);
      }
      await user.update({
        atr_estado_usuario: 'ACTIVO',
        atr_intentos_fallidos: 0,
        atr_reset_expiry: null
      });
    }

    // Verificar contraseña
    const match = await bcrypt.compare(password, user.atr_contrasena);
    if (!match) {
      const attempts = user.atr_intentos_fallidos + 1;
      await user.update({ atr_intentos_fallidos: attempts });
      
      if (attempts >= config.security.maxLoginAttempts) {
        await user.update({
          atr_estado_usuario: 'BLOQUEADO',
          atr_reset_expiry: new Date(Date.now() + config.security.lockTime)
        });
        throw new Error(`Cuenta bloqueada tras ${config.security.maxLoginAttempts} intentos fallidos`);
      }
      
      throw new Error(`Credenciales inválidas. Restan ${config.security.maxLoginAttempts - attempts} intentos`);
    }

    // Resetear intentos fallidos
    await user.update({
      atr_intentos_fallidos: 0,
      atr_reset_expiry: null,
      atr_fecha_ultima_conexion: new Date()
    });

    // Verificar primer ingreso
    if (user.atr_primer_ingreso) {
      const resetToken = generateToken();
      await user.update({ 
        atr_reset_token: resetToken,
        atr_reset_expiry: new Date(Date.now() + 3600000)
      });
      
      logger.auth('Primer ingreso detectado', { userId: user.atr_id_usuario });
      return { firstLogin: true, resetToken };
    }

    // Verificar 2FA
    if (user.atr_2fa_enabled) {
      logger.auth('2FA requerido', { userId: user.atr_id_usuario });
      return { twoFARequired: true, userId: user.atr_id_usuario };
    }

    // Generar JWT
    const token = jwt.sign(
      { 
        id: user.atr_id_usuario, 
        role: user.atr_id_rol 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Preparar respuesta segura
    const safeUser = user.toJSON();
    delete safeUser.atr_contrasena;
    delete safeUser.atr_intentos_fallidos;
    delete safeUser.atr_reset_token;
    delete safeUser.atr_reset_expiry;

    logger.auth('Login exitoso', { userId: user.atr_id_usuario });
    
    return { 
      token, 
      user: safeUser, 
      message: 'Inicio de sesión exitoso' 
    };
  }

  static async changePassword(userId, newPassword, confirmPassword) {
    if (newPassword !== confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar historial de contraseñas
    const passwordHistory = await PasswordHistory.findAll({
      where: { atr_id_usuario: userId },
      order: [['atr_fecha_creacion', 'DESC']],
      limit: 5
    });
    
    for (const oldPassword of passwordHistory) {
      const isSame = await bcrypt.compare(newPassword, oldPassword.atr_contrasena);
      if (isSame) {
        throw new Error('No puedes reutilizar contraseñas anteriores');
      }
    }
    
    const hashedNew = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    await user.update({
      atr_contrasena: hashedNew,
      atr_primer_ingreso: false,
      atr_reset_token: null,
      atr_reset_expiry: null
    });
    
    await PasswordHistory.create({
      atr_id_usuario: userId,
      atr_contrasena: hashedNew
    });

    logger.auth('Contraseña cambiada', { userId });
    
    return { message: 'Contraseña actualizada exitosamente' };
  }

  static async forgotPassword(email) {
    const user = await User.findOne({
      where: { atr_correo_electronico: email.toLowerCase() }
    });
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const resetToken = generateToken();
    const resetExpiry = new Date(Date.now() + 3600 * 1000);

    await user.update({
      atr_reset_token: resetToken,
      atr_reset_expiry: resetExpiry
    });

    const resetUrl = `${config.frontend.url}/reset-password?token=${resetToken}`;
    
    await sendResetEmail(user.atr_correo_electronico, resetUrl);

    logger.auth('Solicitud de reset de contraseña', { userId: user.atr_id_usuario });
    
    return { message: 'Correo de recuperación enviado correctamente' };
  }

  static async resetPassword(token, newPassword, confirmPassword) {
    if (newPassword !== confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    const user = await User.findOne({
      where: {
        atr_reset_token: token,
        atr_reset_expiry: { [Op.gt]: new Date() }
      }
    });
    
    if (!user) {
      throw new Error('Token inválido o expirado');
    }

    // Verificar historial de contraseñas
    const passwordHistory = await PasswordHistory.findAll({
      where: { atr_id_usuario: user.atr_id_usuario },
      order: [['atr_fecha_creacion', 'DESC']],
      limit: 5
    });
    
    for (const oldPassword of passwordHistory) {
      const isSame = await bcrypt.compare(newPassword, oldPassword.atr_contrasena);
      if (isSame) {
        throw new Error('No puedes reutilizar contraseñas anteriores');
      }
    }
    
    const hashedNew = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    await user.update({
      atr_contrasena: hashedNew,
      atr_reset_token: null,
      atr_reset_expiry: null
    });
    
    await PasswordHistory.create({
      atr_id_usuario: user.atr_id_usuario,
      atr_contrasena: hashedNew
    });

    logger.auth('Contraseña reseteada', { userId: user.atr_id_usuario });
    
    return { message: 'Contraseña restablecida exitosamente' };
  }

  static async getUserProfile(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const safe = user.toJSON();
    delete safe.atr_contrasena;
    delete safe.atr_intentos_fallidos;
    delete safe.atr_reset_token;
    delete safe.atr_reset_expiry;

    return safe;
  }
}

module.exports = AuthService; 