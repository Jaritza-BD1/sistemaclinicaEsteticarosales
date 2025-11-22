import api from './api';
import { getAuthToken } from '../utils/auth';

const API = api.create({ baseURL: '/api/consultations' });

API.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  response => response,
  error => {
    console.error('Consultation API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Endpoints principales
export const fetchConsultationsByPatient = (patientId) => API.get(`/?patientId=${patientId}`);
export const getConsultation = (id) => API.get(`/${id}`);
export const getConsultationByAppointment = (appointmentId) => API.get(`/appointment/${appointmentId}`);
export const createConsultation = (data) => API.post('/', data);
export const updateConsultation = (id, data) => API.put(`/${id}`, data);
export const finishConsultation = (id) => API.post(`/${id}/finish`);
export const deleteConsultation = (id) => API.delete(`/${id}`);

// Exámenes
export const createExamOrder = (consultationId, data) => API.post(`/${consultationId}/exams`, data);
export const getExamOrders = (consultationId) => API.get(`/${consultationId}/exams`);

// Recetas
export const createPrescription = (consultationId, data) => API.post(`/${consultationId}/prescriptions`, data);
export const getPrescriptions = (consultationId) => API.get(`/${consultationId}/prescriptions`);
export const updatePrescriptionStatus = (id, data) => API.put(`/prescriptions/${id}/status`, data);

// Tratamientos
export const createTreatments = (consultationId, data) => API.post(`/${consultationId}/treatments`, data);
export const getTreatments = (consultationId) => API.get(`/${consultationId}/treatments`);
export const updateTreatmentSession = (id, data) => API.patch(`/treatments/${id}/session`, data);

// Mock helpers (useful para UI antes de tener backend)
export const mockConsultationsForPatient = (patientId) => {
  return Promise.resolve({
    data: {
      data: [
        {
          atr_id_consulta: 1001,
          atr_id_paciente: patientId,
          atr_id_medico: 1,
          atr_fecha_consulta: new Date().toISOString(),
          atr_notas_clinicas: 'Consulta de prueba: dolor leve en área tratada.',
          atr_seguimiento: 1,
          atr_estado_seguimiento: 'PENDIENTE'
        },
        {
          atr_id_consulta: 1002,
          atr_id_paciente: patientId,
          atr_id_medico: 2,
          atr_fecha_consulta: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString(),
          atr_notas_clinicas: 'Control post-tratamiento. Mejoría evidente.',
          atr_seguimiento: 0,
          atr_estado_seguimiento: 'COMPLETADO'
        }
      ]
    }
  });
};

export default API;
