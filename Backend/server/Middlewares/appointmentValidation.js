// File: server/middlewares/appointmentValidation.js
const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const create = [
  body('pacienteId').isInt().withMessage('ID de paciente es requerido y debe ser numérico'),
  body('medicoId').isInt().withMessage('ID de médico es requerido y debe ser numérico'),
  body('fecha').isISO8601().withMessage('Fecha es requerida y debe ser un formato válido').custom((value) => {
    const inputDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (inputDate < today) {
      throw new Error('La fecha debe ser hoy o futura');
    }
    return true;
  }),
  body('hora').matches(/^\d{2}:\d{2}$/).withMessage('Hora es requerida y debe estar en formato HH:MM'),
  body('tipoCita').notEmpty().withMessage('Tipo de cita es requerido'),
  body('motivo').notEmpty().withMessage('Motivo es requerido'),
  body('duracion').isInt({ min: 1 }).withMessage('Duración debe ser un número entero mayor a 0 (en minutos)'),
  validateRequest
];

const update = [
  body('fecha').optional().isISO8601().withMessage('Fecha debe ser un formato válido'),
  body('hora').optional().matches(/^\d{2}:\d{2}$/).withMessage('Hora debe estar en formato HH:MM'),
  body('tipoCita').optional().notEmpty().withMessage('Tipo de cita no puede estar vacío'),
  body('motivo').optional().notEmpty().withMessage('Motivo no puede estar vacío'),
  body('duracion').optional().isInt({ min: 1 }).withMessage('Duración debe ser un número entero mayor a 0 (en minutos)'),
  validateRequest
];

const reschedule = [
  body('nuevaFecha').isISO8601().withMessage('Nueva fecha es requerida y debe ser un formato válido'),
  body('nuevaHora').matches(/^\d{2}:\d{2}$/).withMessage('Nueva hora es requerida y debe estar en formato HH:MM'),
  body('motivo').optional().isString().trim().escape(),
  validateRequest
];

module.exports = {
  create,
  update,
  reschedule,
  validateRequest
};