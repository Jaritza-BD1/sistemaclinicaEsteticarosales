// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Interceptor para agregar tokens a las solicitudes
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
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