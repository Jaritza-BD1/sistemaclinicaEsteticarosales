// Controllers/twoFAController.js
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const { User } = require('../Models/User');
const { BackupCode } = require('../Models/BackupCode');
const { generateToken } = require('../helpers/tokenHelper');

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
    
    // Activar 2FA
    await user.update({ atr_2fa_enabled: true });
    
    res.json({ message: 'Autenticación en dos pasos habilitada correctamente.' });
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
    const user = await User.findByPk(userId);
    
    if (!user || !user.atr_2fa_enabled) {
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