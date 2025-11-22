// File: src/utils/auth.js

// Función para limpiar tokens corruptos
export function cleanCorruptedTokens() {
  const authToken = localStorage.getItem('authToken');
  const token = localStorage.getItem('token');
  
  // Verificar si algún token es demasiado largo o inválido
  if (authToken && (authToken.length > 8192 || !isValidTokenFormat(authToken))) {
    console.warn('Token authToken corrupto detectado, limpiando...');
    localStorage.removeItem('authToken');
  }
  
  if (token && (token.length > 8192 || !isValidTokenFormat(token))) {
    console.warn('Token token corrupto detectado, limpiando...');
    localStorage.removeItem('token');
  }
}

// Función para validar el formato del token
export function isValidTokenFormat(token) {
  if (!token || typeof token !== 'string') {
    console.warn('isValidTokenFormat: Token no es string válido:', typeof token);
    return false;
  }
  
  // Verificar que el token tenga el formato básico de JWT (3 partes separadas por puntos)
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.warn('isValidTokenFormat: Token no tiene 3 partes:', parts.length);
    return false;
  }
  
  // Verificar que cada parte sea válida (base64 URL-safe para JWT)
  // JWT utiliza base64url, que permite '-' y '_' en lugar de '+' y '/'
  try {
    const base64UrlRegex = /^[A-Za-z0-9-_]+=*$/; // padding '=' es opcional
    parts.forEach((part, index) => {
      if (!part || !base64UrlRegex.test(part)) {
        throw new Error(`Invalid base64url in part ${index}`);
      }
    });
    return true;
  } catch (error) {
    console.warn('isValidTokenFormat: Error en validación base64url:', error.message);
    return false;
  }
}

// Función para limpiar tokens corruptos de forma más agresiva
export function aggressiveTokenCleanup() {
  console.log('🧹 Iniciando limpieza agresiva de tokens...');
  
  // Limpiar todos los tokens relacionados con autenticación
  const keysToRemove = [
    'authToken',
    'token',
    'firstLogin',
    'user',
    'userData',
    'session',
    'accessToken',
    'refreshToken'
  ];
  
  keysToRemove.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      console.log(`🗑️ Eliminando ${key}:`, value.substring(0, 50) + '...');
      localStorage.removeItem(key);
    }
  });
  
  // Limpiar cualquier otra clave que contenga 'token' o 'auth'
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key.toLowerCase().includes('token') || key.toLowerCase().includes('auth')) {
      console.log(`🗑️ Eliminando clave relacionada: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ Limpieza agresiva completada');
}

// Función para obtener el token de autenticación
export function getAuthToken() {
  // Limpiar tokens corruptos primero
  cleanCorruptedTokens();
  
  // Intentar obtener el token de ambas ubicaciones posibles
  let token = localStorage.getItem('authToken') || localStorage.getItem('token');
  
  // Si hay token en authToken pero no en token, copiarlo para compatibilidad
  const authToken = localStorage.getItem('authToken');
  const tokenKey = localStorage.getItem('token');
  
  if (authToken && !tokenKey) {
    console.log('🔄 Copiando token de authToken a token para compatibilidad');
    localStorage.setItem('token', authToken);
    token = authToken;
  }
  
  // Verificar si el token es válido y no demasiado largo
  if (token && token.length > 8192) {
    console.warn('Token demasiado largo detectado, limpiando...');
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    return null;
  }
  
  return token;
}

// Función para establecer el token de autenticación
export function setAuthToken(token) {
  if (!token) {
    console.warn('setAuthToken: Token es null o undefined');
    return;
  }
  
  if (token.length > 8192) {
    console.warn('setAuthToken: Token demasiado largo:', token.length, 'caracteres');
    return;
  }
  
  // Limpiar tokens corruptos antes de guardar el nuevo
  cleanCorruptedTokens();
  
  if (!isValidTokenFormat(token)) {
    console.warn('setAuthToken: Token con formato inválido');
    return;
  }
  
  // Limpiar tokens anteriores antes de guardar el nuevo
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  
  localStorage.setItem('authToken', token);
  // Mantener compatibilidad con el token anterior
  localStorage.setItem('token', token);
  console.log('setAuthToken: Token guardado exitosamente');
}

// Función para limpiar el token de autenticación
export function clearAuthToken() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
}

// Función para verificar si el usuario está autenticado
export function isAuthenticated() {
  const token = getAuthToken();
  return !!token;
}
