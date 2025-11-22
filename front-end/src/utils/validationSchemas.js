import * as Yup from 'yup';
import { APPOINTMENT_STATUS } from '../config/appointmentStatus';

// Validation schemas for different forms
export const appointmentValidationSchema = Yup.object({
  motivo: Yup.string()
    .required('El motivo es obligatorio')
    .min(3, 'El motivo debe tener al menos 3 caracteres')
    .max(500, 'El motivo no puede exceder 500 caracteres'),

  fecha: Yup.date()
    .required('La fecha es obligatoria')
    .min(new Date(new Date().setHours(0, 0, 0, 0)), 'La fecha debe ser hoy o futura'),

  hora: Yup.string()
    .required('La hora es obligatoria')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),

  estado: Yup.string()
    .oneOf(Object.keys(APPOINTMENT_STATUS), 'Estado inválido')
    .required('El estado es obligatorio'),

  pacienteId: Yup.number()
    .required('El paciente es obligatorio')
    .positive('ID de paciente inválido')
    .integer('ID de paciente debe ser un número entero'),

  medicoId: Yup.number()
    .required('El médico es obligatorio')
    .positive('ID de médico inválido')
    .integer('ID de médico debe ser un número entero'),

  tipoCitaId: Yup.number()
    .required('El tipo de cita es obligatorio')
    .positive('ID de tipo de cita inválido')
    .integer('ID de tipo de cita debe ser un número entero'),

  duracion: Yup.number()
    .oneOf([30, 45, 60, 90, 120], 'Duración inválida')
    .required('La duración es obligatoria'),
});

// Simplified schema for quick appointment scheduling
export const quickAppointmentValidationSchema = Yup.object({
  pacienteId: Yup.number()
    .required('El paciente es obligatorio')
    .positive('ID de paciente inválido'),

  medicoId: Yup.number()
    .required('El médico es obligatorio')
    .positive('ID de médico inválido'),

  fecha: Yup.date()
    .required('La fecha es obligatoria')
    .min(new Date(new Date().setHours(0, 0, 0, 0)), 'La fecha debe ser hoy o futura'),

  hora: Yup.string()
    .required('La hora es obligatoria')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),

  tipoCitaId: Yup.number()
    .required('El tipo de cita es obligatorio')
    .positive('ID de tipo de cita inválido'),

  motivo: Yup.string()
    .required('El motivo es obligatorio')
    .min(3, 'El motivo debe tener al menos 3 caracteres')
    .max(200, 'El motivo no puede exceder 200 caracteres'),
});

// Schema for rescheduling appointments
export const rescheduleValidationSchema = Yup.object({
  nuevaFecha: Yup.date()
    .required('La nueva fecha es obligatoria')
    .min(new Date(new Date().setHours(0, 0, 0, 0)), 'La fecha debe ser hoy o futura'),

  nuevaHora: Yup.string()
    .required('La nueva hora es obligatoria')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),

  motivo: Yup.string()
    .required('El motivo de reprogramación es obligatorio')
    .min(5, 'El motivo debe tener al menos 5 caracteres')
    .max(300, 'El motivo no puede exceder 300 caracteres'),
});