import api from './api';

export const fetchBitacora = (params) => {
  return api.get('/bitacora/consultar', { params });
};

export const fetchBitacoraStats = (params) => {
  return api.get('/bitacora/estadisticas', { params });
}; 