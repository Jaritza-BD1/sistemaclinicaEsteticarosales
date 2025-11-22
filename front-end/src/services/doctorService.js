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
    especialidades: (doctor.Especialidades || []).map(e => ({ id: e.atr_id_especialidad, atr_especialidad: e.atr_especialidad })),
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
    // Enviar lista de especialidades como array de ids (enteros)
    especialidades: (formData.especialidades || []).map(e => {
      if (typeof e === 'number') return e;
      if (e && (e.atr_id_especialidad || e.id)) return e.atr_id_especialidad || e.id;
      return null;
    }).filter(Boolean),
    telefonos: formData.telefonos || [],
    correos: formData.correos || [],
    direcciones: formData.direcciones || []
  };
}; 