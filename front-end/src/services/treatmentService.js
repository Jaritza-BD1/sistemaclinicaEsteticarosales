import api from './api';
import { getAuthToken } from '../utils/auth';

const API = api.create({ baseURL: '/api/treatments' });

// Interceptor para agregar token de autenticación
API.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
API.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Manejar errores específicos
    if (error.response?.status === 431) {
      console.error('Error 431: Headers demasiado grandes en treatmentService');
      return Promise.reject(new Error('Error de configuración de headers. Por favor, recarga la página.'));
    }
    
    return Promise.reject(error);
  }
);

// CRUD básico
export const fetchTreatments = () => API.get('/');
export const getTreatment = id => API.get(`/${id}`);
export const createTreatment = data => API.post('/', data);
export const updateTreatment = (id, data) => API.put(`/${id}`, data);
export const deleteTreatment = id => API.delete(`/${id}`);

// Rutas adicionales
export const getTreatmentStats = () => API.get('/stats');
export const getTreatmentsByPatient = patientId => API.get(`/patient/${patientId}`);
export const getTreatmentsByDoctor = doctorId => API.get(`/doctor/${doctorId}`);

// Helper para formatear datos de tratamiento para formularios
export const formatTreatmentForForm = (treatment) => {
  return {
    id: treatment.atr_id_tratamiento,
    patientId: treatment.atr_id_paciente,
    doctorId: treatment.atr_id_medico,
    treatmentType: treatment.atr_tipo_tratamiento,
    description: treatment.atr_descripcion,
    startDate: treatment.atr_fecha_inicio,
    endDate: treatment.atr_fecha_fin,
    frequency: treatment.atr_frecuencia,
    duration: treatment.atr_duracion,
    medications: treatment.atr_medicamentos,
    observations: treatment.atr_observaciones,
    status: treatment.atr_estado,
    patient: treatment.patient,
    doctor: treatment.doctor
  };
};

// Helper para formatear datos del formulario para el backend
export const formatFormDataForBackend = (formData) => {
  return {
    patientId: parseInt(formData.patientId),
    doctorId: parseInt(formData.doctorId),
    treatmentType: formData.treatmentType,
    description: formData.description,
    startDate: formData.startDate,
    endDate: formData.endDate,
    frequency: formData.frequency,
    duration: formData.duration,
    medications: formData.medications,
    observations: formData.observations,
    status: formData.status || 'ACTIVO'
  };
}; 