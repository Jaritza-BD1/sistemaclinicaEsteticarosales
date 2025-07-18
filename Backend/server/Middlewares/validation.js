const { validationResult } = require('express-validator');
const ResponseService = require('../services/responseService');
const logger = require('../utils/logger');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Validation error', {
      endpoint: req.originalUrl,
      method: req.method,
      errors: errors.array()
    });
    return ResponseService.validationError(res, errors);
  }
  next();
};

// Validaciones comunes
const commonValidations = {
  username: {
    in: ['body'],
    trim: true,
    isLength: {
      options: { min: 4, max: 15 },
      errorMessage: 'Usuario debe tener entre 4 y 15 caracteres'
    },
    matches: {
      options: /^[A-Z0-9]+$/,
      errorMessage: 'Usuario solo puede contener mayúsculas y números'
    }
  },
  
  email: {
    in: ['body'],
    trim: true,
    isEmail: {
      errorMessage: 'Email inválido'
    },
    normalizeEmail: true
  },
  
  password: {
    in: ['body'],
    isLength: {
      options: { min: 8 },
      errorMessage: 'Contraseña debe tener al menos 8 caracteres'
    },
    matches: [
      {
        options: /[a-z]/,
        errorMessage: 'Contraseña debe contener al menos una minúscula'
      },
      {
        options: /[A-Z]/,
        errorMessage: 'Contraseña debe contener al menos una mayúscula'
      },
      {
        options: /\d/,
        errorMessage: 'Contraseña debe contener al menos un número'
      },
      {
        options: /[!@#$%^&*]/,
        errorMessage: 'Contraseña debe contener al menos un carácter especial'
      }
    ]
  },
  
  confirmPassword: {
    in: ['body'],
    custom: {
      options: (value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Las contraseñas no coinciden');
        }
        return true;
      }
    }
  }
};

module.exports = {
  validateRequest,
  commonValidations
}; 