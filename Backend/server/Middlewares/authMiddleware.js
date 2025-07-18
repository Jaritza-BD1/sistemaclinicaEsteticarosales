const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const config = require('../config/environment');
const ResponseService = require('../services/responseService');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseService.unauthorized(res, 'Token de acceso requerido');
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, config.jwt.secret);
    
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return ResponseService.unauthorized(res, 'Usuario no encontrado');
    }

    if (user.atr_estado_usuario !== 'ACTIVO') {
      return ResponseService.forbidden(res, 'Cuenta no activa');
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Error en autenticación', error);
    
    if (error.name === 'JsonWebTokenError') {
      return ResponseService.unauthorized(res, 'Token inválido');
    }
    
    if (error.name === 'TokenExpiredError') {
      return ResponseService.unauthorized(res, 'Token expirado');
    }
    
    return ResponseService.unauthorized(res, 'Error de autenticación');
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return ResponseService.unauthorized(res, 'Usuario no autenticado');
    }

    if (req.user.atr_id_rol !== 1) { // Asumiendo que rol 1 es admin
      return ResponseService.forbidden(res, 'Acceso denegado. Se requieren permisos de administrador');
    }

    next();
  } catch (error) {
    logger.error('Error verificando permisos de admin', error);
    return ResponseService.forbidden(res, 'Error verificando permisos');
  }
};

module.exports = {
  authenticate,
  isAdmin
}; 