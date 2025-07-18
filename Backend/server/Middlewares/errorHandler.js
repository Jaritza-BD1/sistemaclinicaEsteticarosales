const ResponseService = require('../services/responseService');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log del error
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    endpoint: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.atr_id_usuario
  });

  // Errores de validación
  if (err.name === 'ValidationError') {
    return ResponseService.validationError(res, {
      array: () => Object.keys(err.errors).map(key => ({
        param: key,
        msg: err.errors[key].message,
        value: err.errors[key].value
      }))
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return ResponseService.unauthorized(res, 'Token inválido');
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseService.unauthorized(res, 'Token expirado');
  }

  // Errores de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return ResponseService.validationError(res, {
      array: () => err.errors.map(error => ({
        param: error.path,
        msg: error.message,
        value: error.value
      }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return ResponseService.error(res, 'El recurso ya existe', 409);
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return ResponseService.error(res, 'Referencia inválida', 400);
  }

  // Errores de CORS
  if (err.message === 'Not allowed by CORS') {
    return ResponseService.forbidden(res, 'Origen no permitido');
  }

  // Error por defecto
  const isDevelopment = process.env.NODE_ENV === 'development';
  const message = isDevelopment ? err.message : 'Error interno del servidor';
  const statusCode = err.statusCode || 500;

  return ResponseService.error(res, message, statusCode);
};

module.exports = errorHandler; 