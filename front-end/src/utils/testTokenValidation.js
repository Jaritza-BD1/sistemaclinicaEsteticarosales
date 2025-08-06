// Script de prueba para validación de tokens
// Este archivo se puede ejecutar en la consola del navegador para probar la validación

import { isValidTokenFormat, setAuthToken, getAuthToken, cleanCorruptedTokens } from './auth';

// Función para probar tokens válidos
export const testValidTokens = () => {
  console.log('🧪 === PRUEBA DE TOKENS VÁLIDOS ===');
  
  // Token JWT válido de ejemplo (no real)
  const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  
  console.log('Probando token válido:', validToken.substring(0, 50) + '...');
  console.log('isValidTokenFormat:', isValidTokenFormat(validToken));
  setAuthToken(validToken);
  console.log('getAuthToken:', getAuthToken() ? 'Token encontrado' : 'No token');
};

// Función para probar tokens inválidos
export const testInvalidTokens = () => {
  console.log('🧪 === PRUEBA DE TOKENS INVÁLIDOS ===');
  
  const invalidTokens = [
    null,
    undefined,
    '',
    'invalid.token',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.part',
    'a'.repeat(10000), // Token demasiado largo
  ];
  
  invalidTokens.forEach((token, index) => {
    console.log(`\nToken ${index + 1}:`, token);
    console.log('isValidTokenFormat:', isValidTokenFormat(token));
    setAuthToken(token);
  });
};

// Función para limpiar y verificar estado
export const testCleanup = () => {
  console.log('🧪 === PRUEBA DE LIMPIEZA ===');
  
  // Agregar tokens corruptos
  localStorage.setItem('authToken', 'invalid.token');
  localStorage.setItem('token', 'another.invalid.token');
  
  console.log('Antes de limpieza:');
  console.log('authToken:', localStorage.getItem('authToken'));
  console.log('token:', localStorage.getItem('token'));
  
  cleanCorruptedTokens();
  
  console.log('\nDespués de limpieza:');
  console.log('authToken:', localStorage.getItem('authToken'));
  console.log('token:', localStorage.getItem('token'));
};

// Función principal de prueba
export const runAllTests = () => {
  console.log('🚀 === INICIANDO PRUEBAS DE TOKENS ===');
  
  testValidTokens();
  testInvalidTokens();
  testCleanup();
  
  console.log('\n✅ === PRUEBAS COMPLETADAS ===');
};

// Hacer disponible globalmente para uso en consola
if (typeof window !== 'undefined') {
  window.testTokens = {
    testValidTokens,
    testInvalidTokens,
    testCleanup,
    runAllTests
  };
  
  console.log('🧪 Funciones de prueba disponibles en window.testTokens');
  console.log('📝 Uso: window.testTokens.runAllTests()');
} 