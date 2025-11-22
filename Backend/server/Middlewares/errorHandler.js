const ResponseService = require('../services/responseService');
const logger = require('../utils/logger');

/**
 * Clase personalizada para errores de la aplicación
 */
class CustomError extends Error {
  constructor(message, statusCode, errorCode = null, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Función para generar errores personalizados
 * @param {string} errorCode - Código del error
 * @param {string} message - Mensaje del error
 * @param {Error} originalError - Error original (opcional)
 * @returns {CustomError} Instancia del error personalizado
 */
const generateError = (errorCode, message, originalError = null) => {
  const statusCodes = {
    'BAD_REQUEST': 400,
    'UNAUTHORIZED': 401,
    'FORBIDDEN': 403,
    'NOT_FOUND': 404,
    'CONFLICT': 409,
    'VALIDATION_ERROR': 422,
    'INTERNAL_SERVER_ERROR': 500,
    'SERVICE_UNAVAILABLE': 503
  };

  const statusCode = statusCodes[errorCode] || 500;
  const error = new CustomError(message, statusCode, errorCode);
  
  if (originalError) {
    error.details = {
      originalMessage: originalError.message,
      stack: originalError.stack
    };
  }

  return error;
};

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

  // Errores de subida de archivos (Multer)
  if (err.name === 'MulterError' || (err.code && String(err.code).startsWith('LIMIT_'))) {
    return ResponseService.badRequest(res, err.message || 'Error en la subida de archivos');
  }

  // Errores de tipo de archivo provenientes del fileFilter
  if (err.message && (err.message.includes('Tipo de archivo no permitido') || err.message.includes('not allowed'))) {
    return ResponseService.badRequest(res, err.message);
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

module.exports = { errorHandler, generateError, CustomError }; 