import api from './api';
import { getAuthToken } from '../utils/auth';

const API = api.create({ baseURL: '/api/exams' });

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
export const fetchExams = () => API.get('/');
export const getExam = id => API.get(`/${id}`);
export const createExam = data => API.post('/', data);
export const updateExam = (id, data) => API.put(`/${id}`, data);
export const deleteExam = id => API.delete(`/${id}`);

// Rutas adicionales
export const getExamStats = () => API.get('/stats');
export const getExamsByPatient = patientId => API.get(`/patient/${patientId}`);
export const getExamsByDoctor = doctorId => API.get(`/doctor/${doctorId}`);
export const updateExamResults = (id, data) => API.put(`/${id}/results`, data);

// Helper para formatear datos de examen para formularios
export const formatExamForForm = (exam) => {
  return {
    id: exam.atr_id_examen,
    patientId: exam.atr_id_paciente,
    doctorId: exam.atr_id_medico,
    examType: exam.atr_tipo_examen,
    examName: exam.atr_nombre_examen,
    scheduledDate: exam.atr_fecha_programada,
    priority: exam.atr_prioridad,
    generalObservations: exam.atr_observaciones_generales,
    specificObservations: exam.atr_observaciones_especificas,
    requiresFasting: exam.atr_requiere_ayuno,
    fastingHours: exam.atr_horas_ayuno,
    medicationsToSuspend: exam.atr_medicamentos_suspender,
    contraindications: exam.atr_contraindicaciones,
    preparationInstructions: exam.atr_instrucciones_preparacion,
    cost: exam.atr_costo,
    location: exam.atr_ubicacion,
    status: exam.atr_estado,
    results: exam.atr_resultados,
    interpretation: exam.atr_interpretacion,
    resultsDate: exam.atr_fecha_resultados,
    resultsDoctorId: exam.atr_medico_resultados,
    attachments: exam.atr_archivos_adjuntos,
    patient: exam.patient,
    doctor: exam.doctor,
    resultsDoctor: exam.resultsDoctor
  };
};

// Helper para formatear datos del formulario para el backend
export const formatFormDataForBackend = (formData) => {
  return {
    patientId: parseInt(formData.patientId),
    doctorId: parseInt(formData.doctorId),
    examType: formData.examType,
    examName: formData.examName,
    scheduledDate: formData.scheduledDate,
    priority: formData.priority || 'normal',
    generalObservations: formData.generalObservations,
    specificObservations: formData.specificObservations,
    requiresFasting: formData.requiresFasting || false,
    fastingHours: formData.fastingHours ? parseInt(formData.fastingHours) : null,
    medicationsToSuspend: formData.medicationsToSuspend,
    contraindications: formData.contraindications,
    preparationInstructions: formData.preparationInstructions,
    cost: formData.cost ? parseFloat(formData.cost) : null,
    location: formData.location
  };
};

// Helper para formatear datos de resultados para el backend
export const formatResultsForBackend = (resultsData) => {
  return {
    results: resultsData.results,
    interpretation: resultsData.interpretation,
    resultsDoctorId: resultsData.resultsDoctorId ? parseInt(resultsData.resultsDoctorId) : null,
    attachments: resultsData.attachments || []
  };
}; 