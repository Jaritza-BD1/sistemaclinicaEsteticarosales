// Controllers/twoFAController.js
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const { BackupCode } = require('../Models/BackupCode');
const { generateToken } = require('../helpers/tokenHelper');
const BitacoraService = require('../services/bitacoraService');
const { send2FAEmailCode } = require('../utils/mailer');

// Generar secreto 2FA y QR
exports.generate2FASecret = async (req, res) => {
  try {
    const user = req.user;
    
    // Generar secreto
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `ClínicaEsteticaRosales:${user.atr_usuario}`,
      issuer: 'ClínicaEsteticacRosales'
    });

    // Generar QR Code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Guardar secreto temporalmente (sin activar)
    await user.update({ 
      atr_2fa_secret: secret.base32,
      atr_2fa_enabled: false
    });

    // Generar códigos de respaldo (10 códigos de 10 caracteres)
    const backupCodes = await generateBackupCodes(user.atr_id_usuario);

    await BitacoraService.registrarEvento({
      atr_id_usuario: user.atr_id_usuario,
      atr_id_objetos: 2, // ID del objeto/pantalla de seguridad/2FA
      atr_accion: '2FA Generado',
      atr_descripcion: 'El usuario inició la configuración de 2FA',
      ip_origen: req.ip
    });

    res.json({ 
      qrCode, 
      secret: secret.base32,
      backupCodes,
      message: 'Escanee el código QR con su app de autenticación. Guarde los códigos de respaldo en un lugar seguro.' 
    });
  } catch (error) {
    console.error('Error generando secreto 2FA:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Verificar token 2FA y activar
exports.verify2FAToken = async (req, res) => {
  try {
    const { token } = req.body;
    const user = req.user;
    
    // Verificar token
    const verified = speakeasy.totp.verify({
      secret: user.atr_2fa_secret,
      encoding: 'base32',
      token: token,
      window: 1
    });
    
    if (!verified) {
      return res.status(400).json({ error: 'Código 2FA inválido' });
    }
    // Activar 2FA y marcar como verificado, pendiente de aprobación
    await user.update({ 
      atr_2fa_enabled: true,
      atr_is_verified: true,
      atr_estado_usuario: 'PENDIENTE_APROBACION'
    });
    await BitacoraService.registrarEvento({
      atr_id_usuario: user.atr_id_usuario,
      atr_id_objetos: 2,
      atr_accion: '2FA Activado',
      atr_descripcion: 'El usuario activó la autenticación en dos pasos',
      ip_origen: req.ip
    });
    res.json({ message: 'Autenticación en dos pasos habilitada correctamente. Espera la aprobación de un administrador.' });
  } catch (error) {
    console.error('Error verificando token 2FA:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Deshabilitar 2FA
exports.disable2FA = async (req, res) => {
  try {
    const user = req.user;
    
    // Deshabilitar 2FA
    await user.update({ 
      atr_2fa_enabled: false,
      atr_2fa_secret: null
    });
    
    // Eliminar códigos de respaldo
    await BackupCode.destroy({ 
      where: { atr_usuario: user.atr_id_usuario } 
    });
    
    await BitacoraService.registrarEvento({
      atr_id_usuario: user.atr_id_usuario,
      atr_id_objetos: 2,
      atr_accion: '2FA Desactivado',
      atr_descripcion: 'El usuario desactivó la autenticación en dos pasos',
      ip_origen: req.ip
    });

    res.json({ message: 'Autenticación en dos pasos deshabilitada' });
  } catch (error) {
    console.error('Error deshabilitando 2FA:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Verificar token durante login
exports.verifyLogin2FA = async (req, res) => {
  try {
    const { userId, token } = req.body;
    
    console.log('2FA verify-login request:', { userId, token: token ? '***' : 'undefined' });
    
    // Validación adicional de datos
    if (!userId || !token) {
      console.log('2FA validation failed:', { userId, hasToken: !!token });
      return res.status(400).json({ error: 'ID de usuario y token son requeridos' });
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      console.log('2FA user not found:', { userId });
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }
    
    if (!user.atr_2fa_enabled) {
      console.log('2FA not enabled for user:', { userId });
      return res.status(400).json({ error: '2FA no está habilitado para este usuario' });
    }

    // Verificar token regular
    const verified = speakeasy.totp.verify({
      secret: user.atr_2fa_secret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (verified) {
      console.log('2FA token verified successfully for user:', { userId });
      // Generar JWT para autenticación completa
      const authToken = jwt.sign(
        { id: user.atr_id_usuario, role: user.atr_id_rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Preparar respuesta segura
      const safeUser = user.toJSON();
      delete safeUser.atr_contrasena;
      delete safeUser.atr_2fa_secret;
      delete safeUser.atr_reset_token;
      delete safeUser.atr_reset_expiry;
      
      return res.json({ 
        token: authToken, 
        user: safeUser,
        message: 'Autenticación en dos pasos exitosa' 
      });
    }

    // Verificar si es un código de respaldo
    const backupCode = await BackupCode.findOne({
      where: {
        atr_usuario: user.atr_id_usuario,
        atr_codigo: token,
        atr_utilizado: false
      }
    });

    if (backupCode) {
      console.log('2FA backup code used for user:', { userId });
      // Marcar el código como usado
      await backupCode.update({
        atr_utilizado: true,
        atr_fecha_utilizacion: new Date()
      });

      // Generar JWT
      const authToken = jwt.sign(
        { id: user.atr_id_usuario, role: user.atr_id_rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Preparar respuesta segura
      const safeUser = user.toJSON();
      delete safeUser.atr_contrasena;
      delete safeUser.atr_2fa_secret;
      delete safeUser.atr_reset_token;
      delete safeUser.atr_reset_expiry;
      
      return res.json({ 
        token: authToken,
        user: safeUser,
        message: 'Código de respaldo utilizado. Genere nuevos códigos.' 
      });
    }

    console.log('2FA invalid token for user:', { userId });
    res.status(400).json({ error: 'Token o código de respaldo inválido' });
  } catch (error) {
    console.error('Error verificando token de login 2FA:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Generar nuevos códigos de respaldo
exports.generateNewBackupCodes = async (req, res) => {
  try {
    const user = req.user;
    
    // Invalidar todos los códigos anteriores del usuario
    await BackupCode.update(
      { atr_utilizado: true },
      { where: { atr_usuario: user.atr_id_usuario } }
    );

    // Generar nuevos códigos
    const newCodes = await generateBackupCodes(user.atr_id_usuario);

    res.json({ 
      backupCodes: newCodes,
      message: 'Nuevos códigos de respaldo generados. Los códigos antiguos ya no son válidos.' 
    });
  } catch (error) {
    console.error('Error generando nuevos códigos de respaldo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Helper: Generar códigos de respaldo y guardar en BD
async function generateBackupCodes(userId) {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    // Generar código alfanumérico de 10 caracteres
    const code = generateToken(10);
    codes.push(code);
    await BackupCode.create({
      atr_usuario: userId,
      atr_codigo: code
    });
  }
  return codes;
}

// Reenviar código 2FA por email
exports.resend2FACode = async (req, res) => {
  try {
    const { userId } = req.body;
    
    console.log('2FA resend code request - body:', req.body);
    console.log('2FA resend code request for user:', userId);
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }
    
    if (!user.atr_2fa_enabled) {
      return res.status(400).json({ error: '2FA no está habilitado para este usuario' });
    }

    // Generar código de 6 dígitos
    const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardar el código temporalmente (podrías usar Redis en producción)
    await user.update({ 
      atr_email_2fa_code: emailCode,
      atr_email_2fa_expiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
    });

    // Enviar email con el código
    await send2FAEmailCode(user.atr_correo_electronico, emailCode, user.atr_nombre_usuario);

    console.log('2FA email code sent to user:', userId);
    
    res.json({ message: 'Código enviado por email' });
  } catch (error) {
    console.error('Error reenviando código 2FA:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Verificar código 2FA enviado por email
exports.verifyEmail2FACode = async (req, res) => {
  try {
    const { userId, token } = req.body;
    
    console.log('2FA verify email code request for user:', userId);
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }
    
    if (!user.atr_2fa_enabled) {
      return res.status(400).json({ error: '2FA no está habilitado para este usuario' });
    }

    // Verificar el código
    if (user.atr_email_2fa_code !== token || 
        !user.atr_email_2fa_expiry || 
        user.atr_email_2fa_expiry < new Date()) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }

    // Limpiar el código usado
    await user.update({ 
      atr_email_2fa_code: null,
      atr_email_2fa_expiry: null
    });

    // Generar JWT para autenticación completa
    const authToken = jwt.sign(
      { id: user.atr_id_usuario, role: user.atr_id_rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Preparar respuesta segura
    const safeUser = user.toJSON();
    delete safeUser.atr_contrasena;
    delete safeUser.atr_2fa_secret;
    delete safeUser.atr_reset_token;
    delete safeUser.atr_reset_expiry;
    delete safeUser.atr_email_2fa_code;
    delete safeUser.atr_email_2fa_expiry;
    
    console.log('2FA email code verified successfully for user:', userId);
    
    return res.json({ 
      token: authToken, 
      user: safeUser,
      message: 'Verificación por email exitosa' 
    });
  } catch (error) {
    console.error('Error verificando código 2FA por email:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};