// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  maxContentLength: 10 * 1024 * 1024, // 10MB
  maxBodyLength: 10 * 1024 * 1024, // 10MB
});

// Función para obtener el token de autenticación
const getAuthToken = () => {
  // Intentar obtener el token de ambas ubicaciones posibles
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  
  // Verificar si el token es demasiado largo (más de 8KB)
  if (token && token.length > 8192) {
    console.warn('Token demasiado largo detectado, limpiando...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    return null;
  }
  
  return token;
};

// Interceptor para agregar tokens a las solicitudes
api.interceptors.request.use(
  config => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Limpiar headers innecesarios para reducir el tamaño
    const essentialHeaders = {
      'Content-Type': config.headers['Content-Type'],
      'Authorization': config.headers['Authorization'],
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    config.headers = essentialHeaders;
    
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  // Mantener el response completo (axios) para que los componentes que esperan
  // `response.data` sigan funcionando. No devolvemos solo response.data.
  response => response,
  error => {
    // Si el error proviene de axios con response, adjuntamos un mensaje legible
    const status = error.response?.status;
    const data = error.response?.data || {};

    if (status === 431) {
      console.error('Error 431: Headers demasiado grandes');
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      // Adjuntar un mensaje en error.customMessage pero rechazar el error axios
      error.customMessage = 'Error de configuración de headers. Por favor, recarga la página.';
      return Promise.reject(error);
    }

    if (status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      // No redirigir automáticamente en el interceptor; preservar comportamiento
      error.customMessage = data.error || data.message || 'No autenticado';
      return Promise.reject(error);
    }

    if (status === 422) {
      error.customMessage = 'Error de validación';
      return Promise.reject(error);
    }

    // Priorizar campos `error` y `message` que usa el backend
    error.customMessage = data.error || data.message || 'Error de conexión';
    return Promise.reject(error);
  }
);

export default api;