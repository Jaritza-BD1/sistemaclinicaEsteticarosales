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
export const fetchDoctors = (params = {}) =>
  API.get('/', { params })
    .then(res => {
      // Retornar el body completo para que el slice pueda leer data + meta/pagination
      if (res && res.data) {
        return res.data;
      }
      return res;
    });
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
  // aceptar tanto la forma con prefijos 'atr_' como la forma plana usada en algunos formularios
  const nombre = formData.nombre ?? formData.atr_nombre ?? '';
  const apellido = formData.apellido ?? formData.atr_apellido ?? '';
  const identidad = formData.identidad ?? formData.atr_identidad ?? '';
  const fechaNacimiento = formData.fechaNacimiento ?? formData.atr_fecha_nacimiento ?? '';
  const generoRaw = formData.genero ?? formData.atr_id_genero ?? formData.atr_genero ?? null;
  const numeroColegiado = formData.numeroColegiado ?? formData.atr_numero_colegiado ?? '';

  const genero = generoRaw === null || generoRaw === '' ? null : Number(generoRaw);

  // Normalizar especialidades: aceptar array de ids, o array de objetos con atr_id_especialidad/id
  const especialidadesRaw = formData.especialidades ?? formData.Especialidades ?? [];
  const especialidades = (especialidadesRaw || []).map(e => {
    if (typeof e === 'number') return e;
    if (!e) return null;
    return e.atr_id_especialidad ?? e.id ?? e.value ?? null;
  }).filter(Boolean);

  return {
    atr_nombre: nombre,
    atr_apellido: apellido,
    atr_identidad: identidad,
    atr_fecha_nacimiento: fechaNacimiento,
    atr_id_genero: genero,
    atr_numero_colegiado: numeroColegiado,
    especialidades,
    telefonos: formData.telefonos ?? formData.telefonos ?? [],
    correos: formData.correos ?? formData.correos ?? [],
    direcciones: formData.direcciones ?? formData.direcciones ?? []
  };
}; 