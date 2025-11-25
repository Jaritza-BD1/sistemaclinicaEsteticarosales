// middlewares/authMiddlewares.js
const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const authenticate = async (req, res, next) => {
  try {
    // 1. Extraer token de forma robusta
    const authHeader = req.headers.authorization;
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.header('Authorization')) {
      token = req.header('Authorization').replace('Bearer ', '');
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    // 2. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Buscar usuario
    const user = await User.findOne({
      where: { atr_id_usuario: decoded.id || decoded.userId }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // 4. Verificar estado de cuenta
    if (user.atr_estado_usuario !== 'ACTIVO') {
      const statusMessages = {
        'PENDIENTE_VERIFICACION': 'Verifica tu email primero',
        'PENDIENTE_APROBACION': 'Cuenta pendiente de aprobación',
        'BLOQUEADO': 'Cuenta bloqueada. Contacta al administrador',
        'RECHAZADO': 'Cuenta rechazada'
      };
      console.debug('[auth] Usuario con estado no activo:', {
        id: user.atr_id_usuario,
        estado: user.atr_estado_usuario
      });
      
      return res.status(403).json({
        error: statusMessages[user.atr_estado_usuario] || 'Cuenta no activa',
        status: user.atr_estado_usuario
      });
    }

    // 5. Verificar bloqueo temporal
    if (user.atr_reset_expiry && new Date(user.atr_reset_expiry) > new Date()) {
      const unlockTime = new Date(user.atr_reset_expiry).toLocaleTimeString();
      console.debug('[auth] Usuario bloqueado temporalmente:', {
        id: user.atr_id_usuario,
        resetExpiry: user.atr_reset_expiry
      });
      return res.status(403).json({
        error: `Cuenta bloqueada temporalmente hasta ${unlockTime}`
      });
    }

    // 6. Actualizar última conexión (solo ese campo)
    await User.update(
      { atr_fecha_ultima_conexion: new Date() },
      { where: { atr_id_usuario: user.atr_id_usuario } }
    );

    // 7. Adjuntar usuario y token al request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    res.status(500).json({ error: 'Error en el servidor durante la autenticación' });
  }
};

const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    // ID 1 = Administrador
    if (req.user.atr_id_rol !== 1) {
      return res.status(403).json({ 
        error: 'Acceso restringido a administradores' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware isAdmin:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const checkFirstLogin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    if (req.user.atr_primer_ingreso) {
      return res.status(403).json({
        error: 'Debes cambiar tu contraseña en el primer ingreso',
        firstLogin: true,
        resetToken: req.user.atr_reset_token // Para flujo de cambio
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware checkFirstLogin:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Middleware combinado para rutas que requieren autenticación y ser admin
const authenticateAdmin = [authenticate, isAdmin];

module.exports = { 
  authenticate, 
  isAdmin, 
  checkFirstLogin,
  authenticateAdmin
};
