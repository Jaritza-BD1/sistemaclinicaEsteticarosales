import api from './api';
import { getAuthToken } from '../utils/auth';

const API = api.create({ baseURL: '/api/doctors' });

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
export const fetchDoctors = () => API.get('/');
export const getDoctor = id => API.get(`/${id}`);
export const createDoctor = data => API.post('/', data);
export const updateDoctor = (id, data) => API.put(`/${id}`, data);
export const deleteDoctor = id => API.delete(`/${id}`);

// Obtener médicos activos para formularios
export const getActiveDoctors = () => API.get('/active');

// Helper para formatear datos de médico para formularios
export const formatDoctorForForm = (doctor) => {
  return {
    id: doctor.atr_id_medico,
    nombre: doctor.atr_nombre,
    apellido: doctor.atr_apellido,
    identidad: doctor.atr_identidad,
    fechaNacimiento: doctor.atr_fecha_nacimiento,
    genero: doctor.atr_id_genero,
    numeroColegiado: doctor.atr_numero_colegiado,
    especialidadPrincipal: doctor.atr_especialidad_principal,
    estado: doctor.atr_estado_medico,
    telefonos: doctor.telefonos || [],
    correos: doctor.correos || [],
    direcciones: doctor.direcciones || []
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
    atr_numero_colegiado: formData.numeroColegiado,
    atr_especialidad_principal: formData.especialidadPrincipal,
    atr_estado_medico: formData.estado || 'ACTIVO',
    telefonos: formData.telefonos || [],
    correos: formData.correos || [],
    direcciones: formData.direcciones || []
  };
}; 