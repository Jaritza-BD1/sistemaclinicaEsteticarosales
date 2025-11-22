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
// List / Search patients with optional query params
export const getPatients = (params) => API.get('/', { params });
// Backwards-compatible alias
export const fetchPatients = (params) => getPatients(params);

export const getPatientById = (id) => API.get(`/${id}`);
// Backwards-compatible alias
export const getPatient = (id) => getPatientById(id);

export const createPatient = (data) => API.post('/', data);
export const updatePatient = (id, data) => API.put(`/${id}`, data);
export const deletePatient = (id) => API.delete(`/${id}`);

export const getPatientHistory = (id, params) => API.get(`/${id}/history`, { params });

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
    atr_genero: formData.generoLabel || null,
    atr_id_tipo_paciente: formData.tipoPaciente !== undefined ? parseInt(formData.tipoPaciente) : null,
    // atr_numero_expediente must be an integer in the DB. If the form provides
    // a purely numeric value we convert it, otherwise send null so the
    // model's beforeCreate hook can generate one. This avoids DB errors
    // when users paste alphanumeric codes like 'EXP001'.
    atr_numero_expediente: formData.numeroExpediente !== undefined && formData.numeroExpediente !== null && String(formData.numeroExpediente).trim() !== '' && /^[0-9]+$/.test(String(formData.numeroExpediente)) ? parseInt(String(formData.numeroExpediente), 10) : null,
    atr_estado_paciente: formData.estado || 'ACTIVO',
    telefonos: formData.telefonos || [],
    correos: formData.correos || [],
    direcciones: formData.direcciones || [],
    alergias: formData.alergias || [],
    vacunas: formData.vacunas || []
  };
}; 

// Obtener tipos de paciente (si el backend expone /api/patients/types)
export const getPatientTypes = async () => {
  try {
    return await API.get('/types');
  } catch (err) {
    // Si no existe endpoint, devolver null para que el componente use valores por defecto
    return null;
  }
};