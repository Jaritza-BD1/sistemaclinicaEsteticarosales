// File: src/services/appointmentService.js
import api from './api';
import { APPOINTMENT_STATUS, getStatusNameById } from '../config/appointmentStatus';

// Helper para normalizar la respuesta y mantener compatibilidad con el
// contrato antiguo (los thunks esperan `response.data.data`).
const normalize = (res) => {
  // Caso 1: el cliente `api` ya devolvió `response.data` (p. ej. { success, data })
  // En ese caso devolvemos un objeto con `data: res` para que `response.data.data` exista.
  if (res && typeof res === 'object' && Object.prototype.hasOwnProperty.call(res, 'success')) {
    return { data: res };
  }

  // Caso 2: es la respuesta axios completa (con `res.data` que contiene { success, data })
  // en ese caso no hacemos nada.
  return res;
};

// CRUD básico
export const fetchAppointments = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
  if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
  if (filters.estado) params.append('estado', filters.estado);
  if (filters.medicoId) params.append('medicoId', filters.medicoId);
  if (filters.pacienteId) params.append('pacienteId', filters.pacienteId);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  return normalize(await api.get(`/appointments?${params.toString()}`));
};

export const getCalendarAppointments = async (start, end) => {
  return normalize(await api.get(`/appointments/calendar?start=${start}&end=${end}`));
};

export const getTodayAppointments = () =>
  normalize(api.get('/appointments/today'));

export const createAppointment = async (data) => normalize(await api.post('/appointments', data));
export const getAppointment = async (id) => normalize(await api.get(`/appointments/${id}`));
export const updateAppointment = async (id, data) => normalize(await api.put(`/appointments/${id}`, data));
export const deleteAppointment = async (id) => normalize(await api.delete(`/appointments/${id}`));

// Operaciones específicas
export const updateAppointmentStatus = async (id, statusName) => {
  // The backend expects the status name string in `req.body.status`.
  // Send the status as provided (e.g. 'EN_CONSULTA').
  if (!statusName || typeof statusName !== 'string') {
    throw new Error(`Estado ${statusName} no válido`);
  }
  return normalize(await api.patch(`/appointments/${id}/status`, { status: statusName }));
};
export const rescheduleAppointment = async (id, data) => normalize(await api.post(`/appointments/${id}/reschedule`, data));

// Legacy functions for compatibility
export const confirmAppointment = async (id) => updateAppointmentStatus(id, APPOINTMENT_STATUS.CONFIRMADA);
export const cancelAppointment = async (id, reason) => updateAppointmentStatus(id, APPOINTMENT_STATUS.CANCELADA);

// Datos para formularios
export const getPatients = async () => normalize(await api.get('/appointments/patients'));
export const getDoctors = async () => normalize(await api.get('/appointments/doctors'));
export const getAppointmentStates = async () => normalize(await api.get('/appointments/states'));
export const getAppointmentTypes = async () => normalize(await api.get('/appointments/types'));
// Obtener usuarios (sin paginación extensa para select)
export const getUsers = async (params = {}) => normalize(await api.get('/admin/users', { params }));

// Recordatorios (si existe endpoint)
export const sendReminders = async () => normalize(await api.post('/appointments/reminders/send'));

// Funciones para recordatorios de citas
export const getAppointmentReminders = async (appointmentId) => {
  return normalize(await api.get(`/appointments/${appointmentId}/reminders`));
};

export const createAppointmentReminder = async (appointmentId, reminderData) => {
  return normalize(await api.post(`/appointments/${appointmentId}/reminders`, reminderData));
};

export const cancelAppointmentReminder = async (appointmentId, reminderId) => {
  return normalize(await api.put(`/appointments/${appointmentId}/reminders/${reminderId}/cancel`));
};

export const updateReminderStatus = async (appointmentId, reminderId, statusData) => {
  return normalize(await api.put(`/appointments/${appointmentId}/reminders/${reminderId}/status`, statusData));
};

// Función para check-in de pacientes
export const checkInAppointment = async (appointmentId) => {
  return normalize(await api.patch(`/appointments/${appointmentId}/checkin`));
};

// Servicios de pagos
// Citas en estado PENDIENTE_PAGO
export const fetchPendingPayments = async (params = {}) => {
  const response = await api.get('/payments/pending', { params });
  return response.data.data;
};

// Pagar una cita
export const payAppointment = async (appointmentId, payload = {}) => {
  const response = await api.post(`/payments/${appointmentId}/pay`, payload);
  return response.data.data;
};

// Helper para formatear datos de cita para el calendario
export const formatAppointmentForCalendar = (appointment) => {
  const startDate = new Date(`${appointment.atr_fecha_cita} ${appointment.atr_hora_cita}`);
  const duration = appointment.atr_duracion || 60; // 60 minutos por defecto
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000); // duración en minutos

  // Obtener el nombre del estado
  const statusName = appointment.EstadoCita?.atr_nombre_estado || getStatusNameById(appointment.atr_id_estado);
  
  return {
    id: String(appointment.atr_id_cita),
    title: appointment.atr_motivo_cita,
    // Store ISO strings to keep Redux state serializable; UI components
    // (FullCalendar / moment) can parse ISO strings as needed.
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    type: 'appointment',
    patientId: appointment.atr_id_paciente,
    doctorId: appointment.atr_id_medico,
    status: appointment.atr_id_estado,
    statusName: statusName,
    typeName: appointment.TipoCita?.atr_nombre_tipo_cita,
    area: appointment.TipoCita?.atr_area,
    duration: duration,
    reminder: appointment.Recordatorio?.atr_fecha_hora_envio ? new Date(appointment.Recordatorio.atr_fecha_hora_envio).toISOString() : null,
    patient: appointment.Patient,
    doctor: appointment.Doctor,
    user: appointment.User
  };
};

// Helper para formatear datos del formulario para el backend
export const formatFormDataForBackend = (formData) => {
  return {
    pacienteId: parseInt(formData.pacienteId),
    medicoId: parseInt(formData.medicoId),
    fecha: formData.fecha,
    hora: formData.hora,
    // En el backend algunos controladores esperan `tipoCita` (id) en vez de `tipoCitaId`.
    // Enviar ambos para máxima compatibilidad.
    tipoCitaId: formData.tipoCitaId ? parseInt(formData.tipoCitaId) : null,
    tipoCita: formData.tipoCitaId ? parseInt(formData.tipoCitaId) : (formData.tipoCita ? parseInt(formData.tipoCita) : null),
    motivo: formData.motivo,
    estado: formData.estado || 'PROGRAMADA',
    duracion: parseInt(formData.duracion) || 60, // 60 minutos por defecto
  };
};