// frontend/src/services/authService.js
import axios from 'axios';

// URL base de la API, configurada en .env (REACT_APP_API_URL)
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * Solicita recuperación de contraseña para el email proporcionado.
 * @param {string} email - Correo electrónico del usuario.
 * @returns {Promise<{message: string}>} - Respuesta del servidor.
 */
export async function requestPasswordRecovery(email) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/forgot-password`,
      { email }
    );
    return response.data;
  } catch (error) {
    // TODO: mejorar manejo de errores (mostrar notificaciones, logs)
    throw error;
  }
}

/**
 * Obtiene el usuario actual desde localStorage.
 * @returns {Object|null} - Objeto con datos del usuario o null.
 */
export function getCurrentUser() {
  // TODO: JWT, validar expiración de token antes de retornar
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Inicia sesión con credenciales.
 * @param {string} email - Correo electrónico.
 * @param {string} password - Contraseña.
 * @returns {Promise<Object>} - Datos del usuario y token.
 */
export async function login(email, password) {
  // TODO: implementar llamada al endpoint de login
  // ej. const response = await axios.post(
  //   `${API_BASE_URL}/api/auth/login`,
  //   { email, password }
  // );
  // localStorage.setItem('currentUser', JSON.stringify(response.data));
  // return response.data;
}

/**
 * Cierra la sesión del usuario.
 */
export function logout() {
  // TODO: notificar al backend para invalidar token
  localStorage.removeItem('currentUser');
  // TODO: redirigir al login o página pública
}
