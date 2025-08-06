import api from './api';
import { getAuthToken } from '../utils/auth';

const API = api.create({ baseURL: '/api/patients' });

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
export const fetchPatients = () => API.get('/');
export const getPatient = id => API.get(`/${id}`);
export const createPatient = data => API.post('/', data);
export const updatePatient = (id, data) => API.put(`/${id}`, data);
export const deletePatient = id => API.delete(`/${id}`);

// Obtener pacientes activos para formularios
export const getActivePatients = () => API.get('/active');

// Helper para formatear datos de paciente para formularios
export const formatPatientForForm = (patient) => {
  return {
    id: patient.atr_id_paciente,
    nombre: patient.atr_nombre,
    apellido: patient.atr_apellido,
    identidad: patient.atr_identidad,
    fechaNacimiento: patient.atr_fecha_nacimiento,
    genero: patient.atr_id_genero,
    numeroExpediente: patient.atr_numero_expediente,
    estado: patient.atr_estado_paciente,
    telefonos: patient.telefonos || [],
    correos: patient.correos || [],
    direcciones: patient.direcciones || [],
    alergias: patient.alergias || [],
    vacunas: patient.vacunas || []
  };
};

// Helper para formatear datos del formulario para el backend
export const formatFormDataForBackend = (formData) => {
  return {
    atr_nombre: formData.nombre,
    atr_apellido: formData.apellido,
    atr_identidad: formData.identidad,
    atr_fecha_nacimiento: formData.fechaNacimiento,
    atr_id_genero: parseInt(formData.genero),
    atr_numero_expediente: formData.numeroExpediente,
    atr_estado_paciente: formData.estado || 'ACTIVO',
    telefonos: formData.telefonos || [],
    correos: formData.correos || [],
    direcciones: formData.direcciones || [],
    alergias: formData.alergias || [],
    vacunas: formData.vacunas || []
  };
}; 