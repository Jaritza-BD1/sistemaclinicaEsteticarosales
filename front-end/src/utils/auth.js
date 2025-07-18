// File: src/utils/auth.js
export function getAuthToken() {
  return localStorage.getItem('authToken');
}
