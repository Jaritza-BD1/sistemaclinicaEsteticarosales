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
  response => {
    // Si la respuesta es exitosa, devolver los datos
    if (response.data && response.data.success !== undefined) {
      return response.data;
    }
    return response;
  },
  error => {
    // Manejar errores específicos
    if (error.response?.status === 431) {
      console.error('Error 431: Headers demasiado grandes');
      // Limpiar tokens potencialmente corruptos
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      return Promise.reject({
        success: false,
        message: 'Error de configuración de headers. Por favor, recarga la página.'
      });
    }
    
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Manejar errores de validación
    if (error.response?.status === 422) {
      return Promise.reject({
        success: false,
        message: 'Error de validación',
        errors: error.response.data.errors
      });
    }
    
    // Manejar otros errores
    const errorMessage = error.response?.data?.message || 'Error de conexión';
    return Promise.reject({
      success: false,
      message: errorMessage
    });
  }
);

export default api;