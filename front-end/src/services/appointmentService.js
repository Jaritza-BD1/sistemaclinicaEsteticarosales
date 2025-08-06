// File: src/services/appointmentService.js
import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const API = axios.create({ baseURL: '/api/appointments' });

// Interceptor para agregar token de autenticación
API.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor para manejar errores
API.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// CRUD básico
export const fetchAppointments = () => API.get('/');
export const createAppointment = data => API.post('/', data);
export const getAppointment = id => API.get(`/${id}`);
export const updateAppointment = (id, data) => API.put(`/${id}`, data);
export const deleteAppointment = id => API.delete(`/${id}`);

// Operaciones específicas
export const confirmAppointment = id => API.put(`/${id}/confirm`);
export const rescheduleAppointment = (id, data) => API.put(`/${id}/reschedule`, data);
export const cancelAppointment = (id, reason) => API.post(`/${id}/cancel`, { reason });

// Datos para formularios
export const getPatients = () => API.get('/patients');
export const getDoctors = () => API.get('/doctors');

// Recordatorios
export const sendReminders = () => API.post('/reminders/send');

// Helper para formatear datos de cita para el calendario
export const formatAppointmentForCalendar = (appointment) => {
  const startDate = new Date(`${appointment.atr_fecha_cita} ${appointment.atr_hora_cita}`);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora por defecto
  
  return {
    id: String(appointment.atr_id_cita),
    title: appointment.atr_motivo_cita,
    start: startDate,
    end: endDate,
    type: 'appointment',
    patientId: appointment.atr_id_paciente,
    doctorId: appointment.atr_id_medico,
    status: appointment.atr_id_estado,
    reminder: appointment.Recordatorio?.atr_fecha_hora_envio ? new Date(appointment.Recordatorio.atr_fecha_hora_envio) : null,
    patient: appointment.Patient,
    doctor: appointment.Doctor,
    user: appointment.User
  };
};

// Helper para formatear datos del formulario para el backend
export const formatFormDataForBackend = (formData) => {
  const startDateTime = new Date(`${formData.start} ${formData.startTime}`);
  
  return {
    atr_id_paciente: parseInt(formData.patientId),
    atr_id_medico: parseInt(formData.doctorId),
    atr_fecha_cita: formData.start,
    atr_hora_cita: formData.startTime,
    atr_motivo_cita: formData.title,
    atr_id_tipo_cita: parseInt(formData.tipo_cita),
    atr_id_estado: parseInt(formData.status) || 1, // 1 = Pendiente por defecto
    reminder: formData.reminder || null
  };
};