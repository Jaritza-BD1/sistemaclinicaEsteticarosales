const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const authenticate = async (req, res, next) => {
  try {
    // 1. Obtener token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Acceso no autorizado. Token requerido.' });
    }

    // 2. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Buscar usuario en la base de datos con el nuevo modelo
    const user = await User.findOne({ 
      where: { 
        atr_id_usuario: decoded.userId
      } 
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // 4. Verificar estado de la cuenta (solo usuarios Activos pueden acceder)
    if (user.atr_estado_usuario !== 'Activo') {
      let errorMessage = 'Cuenta no activa.';
      
      if (user.atr_estado_usuario === 'Pendiente Verificación') {
        errorMessage = 'Verifica tu email primero';
      } else if (user.atr_estado_usuario === 'Pendiente Aprobación') {
        errorMessage = 'Cuenta pendiente de aprobación';
      } else if (user.atr_estado_usuario === 'Bloqueado') {
        errorMessage = 'Cuenta bloqueada. Contacta al administrador';
      }
      
      return res.status(403).json({ error: errorMessage });
    }

    // 5. Verificar si la cuenta está temporalmente bloqueada
    if (user.atr_reset_expiry && user.atr_reset_expiry > new Date()) {
      return res.status(403).json({ 
        error: `Cuenta bloqueada temporalmente. Intente nuevamente después de ${user.atr_reset_expiry.toLocaleTimeString()}`,
        lockedUntil: user.atr_reset_expiry
      });
    }

    // 6. Adjuntar usuario y token a la solicitud
    req.user = user;
    req.token = token;
    
    // 7. Actualizar fecha de última conexión
    user.atr_fecha_ultima_conexion = new Date();
    await user.save();
    
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Por favor inicie sesión nuevamente.' });
    }
    
    res.status(401).json({ error: 'Autenticación fallida. Token inválido.' });
  }
};

// Middleware para verificar rol de administrador
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    // Verificar si el usuario tiene rol de administrador (atr_id_rol = 1)
    if (req.user.atr_id_rol !== 1) {
      return res.status(403).json({ 
        error: 'Acceso denegado. Se requieren privilegios de administrador' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en verificación de admin:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Middleware para verificar primer ingreso
const checkFirstLogin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    if (req.user.atr_primer_ingreso) {
      return res.status(403).json({ 
        error: 'Primer ingreso detectado. Debes cambiar tu contraseña',
        firstLogin: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en verificación de primer ingreso:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = { 
  authenticate, 
  isAdmin,
  checkFirstLogin
};