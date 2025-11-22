const { validationResult } = require('express-validator');
const { body, param } = require('express-validator');
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

// Patient validation schemas
const patientCreateValidators = [
  body('atr_nombre').isString().trim().isLength({ min: 2 }).withMessage('Nombre es requerido'),
  body('atr_apellido').isString().trim().isLength({ min: 2 }).withMessage('Apellido es requerido'),
  body('atr_identidad').isString().trim().isLength({ min: 6 }).withMessage('Identidad es requerida'),
  body('atr_fecha_nacimiento').isISO8601().withMessage('Fecha de nacimiento inválida'),
  body('atr_id_genero').isInt().withMessage('Género es requerido'),
  // atr_numero_expediente puede venir como número o como cadena numérica.
  // Aceptamos null/undefined, un entero o una cadena compuesta sólo por dígitos.
  body('atr_numero_expediente').optional().custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    if (typeof value === 'number' && Number.isInteger(value)) return true;
    if (typeof value === 'string' && /^\d+$/.test(value.trim())) return true;
    throw new Error('atr_numero_expediente inválido');
  }),
  body('telefonos').optional().isArray(),
  body('telefonos.*.atr_telefono').optional().isString().trim().isLength({ min: 6 }).withMessage('Teléfono inválido'),
  body('correos').optional().isArray(),
  body('correos.*.atr_correo').optional().isEmail().withMessage('Correo inválido'),
  body('direcciones').optional().isArray(),
  body('direcciones.*.atr_direccion_completa').optional().isString().trim().isLength({ min: 5 })
];

const patientUpdateValidators = [
  param('id').isInt().withMessage('ID inválido'),
  body('atr_nombre').optional().isString().trim().isLength({ min: 2 }),
  body('atr_apellido').optional().isString().trim().isLength({ min: 2 }),
  body('atr_identidad').optional().isString().trim(),
  body('atr_fecha_nacimiento').optional().isISO8601(),
  body('atr_id_genero').optional().isInt(),
  body('atr_numero_expediente').optional().custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    if (typeof value === 'number' && Number.isInteger(value)) return true;
    if (typeof value === 'string' && /^\d+$/.test(value.trim())) return true;
    throw new Error('atr_numero_expediente inválido');
  }),
  body('telefonos').optional().isArray(),
  body('telefonos.*.atr_telefono').optional().isString().trim().isLength({ min: 6 }),
  body('correos').optional().isArray(),
  body('correos.*.atr_correo').optional().isEmail(),
  body('direcciones').optional().isArray(),
  body('direcciones.*.atr_direccion_completa').optional().isString().trim()
];

module.exports.patientCreateValidators = patientCreateValidators;
module.exports.patientUpdateValidators = patientUpdateValidators;