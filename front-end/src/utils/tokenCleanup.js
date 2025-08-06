// Token Cleanup Utility
// Este archivo proporciona funciones para limpiar tokens corruptos manualmente

import { cleanCorruptedTokens } from './auth';

// Función para limpiar todos los tokens del localStorage
export const cleanupAllTokens = () => {
  console.log('🧹 Iniciando limpieza de tokens...');
  
  // Limpiar tokens específicos
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  localStorage.removeItem('firstLogin');
  
  // Limpiar cualquier otro token que pueda estar causando problemas
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.toLowerCase().includes('token') || key.toLowerCase().includes('auth'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log(`🗑️ Eliminando: ${key}`);
    localStorage.removeItem(key);
  });
  
  console.log('✅ Limpieza completada');
  return true;
};

// Función para verificar el estado de los tokens
export const checkTokenStatus = () => {
  const authToken = localStorage.getItem('authToken');
  const token = localStorage.getItem('token');
  const firstLogin = localStorage.getItem('firstLogin');
  
  console.log('🔍 Estado de tokens:');
  console.log('authToken:', authToken ? `${authToken.substring(0, 20)}...` : 'No encontrado');
  console.log('token:', token ? `${token.substring(0, 20)}...` : 'No encontrado');
  console.log('firstLogin:', firstLogin);
  
  if (authToken && authToken.length > 8192) {
    console.warn('⚠️ authToken es demasiado largo:', authToken.length, 'caracteres');
  }
  
  if (token && token.length > 8192) {
    console.warn('⚠️ token es demasiado largo:', token.length, 'caracteres');
  }
  
  return { authToken, token, firstLogin };
};

// Función para reiniciar la aplicación después de limpiar tokens
export const resetAppAfterCleanup = () => {
  cleanupAllTokens();
  console.log('🔄 Recargando aplicación en 2 segundos...');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
};

// Función para manejar errores 431 automáticamente
export const handle431Error = () => {
  console.warn('🚨 Error 431 detectado, ejecutando limpieza automática...');
  resetAppAfterCleanup();
};

// Hacer las funciones disponibles globalmente para uso en consola
if (typeof window !== 'undefined') {
  window.tokenCleanup = {
    cleanupAllTokens,
    checkTokenStatus,
    resetAppAfterCleanup,
    handle431Error,
    cleanCorruptedTokens
  };
  
  // Función adicional para debugging inmediato
  window.debugTokens = () => {
    console.log('🔍 === DEBUG TOKENS ===');
    checkTokenStatus();
    console.log('🧹 Ejecutando limpieza automática...');
    cleanupAllTokens();
    console.log('✅ Limpieza completada');
    console.log('🔄 Recargando en 3 segundos...');
    setTimeout(() => window.location.reload(), 3000);
  };
  
  // Función para limpieza agresiva
  window.aggressiveCleanup = () => {
    console.log('🚨 === LIMPIEZA AGRESIVA ===');
    import('./auth').then(({ aggressiveTokenCleanup }) => {
      aggressiveTokenCleanup();
      console.log('🔄 Recargando en 2 segundos...');
      setTimeout(() => window.location.reload(), 2000);
    });
  };
  
  console.log('🛠️ Token cleanup utilities disponibles en window.tokenCleanup');
  console.log('📝 Uso: window.tokenCleanup.checkTokenStatus()');
  console.log('🧹 Uso: window.tokenCleanup.cleanupAllTokens()');
  console.log('🔄 Uso: window.tokenCleanup.resetAppAfterCleanup()');
  console.log('🚨 Uso: window.debugTokens() - Para debugging inmediato');
  console.log('💥 Uso: window.aggressiveCleanup() - Para limpieza agresiva');
} 