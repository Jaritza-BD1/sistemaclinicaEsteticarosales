// frontend/src/services/pharmacyService.js
import api from './api';
import { getAuthToken } from '../utils/auth';

const API = api.create({ baseURL: '/api/products' });

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
export const getAllProducts = () => API.get('/');
export const getProduct = id => API.get(`/${id}`);
export const createProduct = data => API.post('/', data);
export const updateProduct = (id, data) => API.put(`/${id}`, data);
export const deleteProduct = id => API.delete(`/${id}`);

// Rutas adicionales
export const getProductStats = () => API.get('/stats');
export const getProductsByCategory = category => API.get(`/category/${category}`);

// Helper para formatear datos de producto para formularios
export const formatProductForForm = (product) => {
  return {
    id: product.atr_id_producto,
    nombre: product.atr_nombre_producto,
    descripcion: product.atr_descripcion,
    codigoBarra: product.atr_codigo_barra,
    categoria: product.atr_categoria,
    unidadMedida: product.atr_unidad_medida,
    proveedor: product.atr_proveedor,
    precio: product.atr_precio_venta_unitario,
    stock: product.atr_stock_actual,
    stockMinimo: product.atr_stock_minimo,
    stockMaximo: product.atr_stock_maximo,
    activo: product.atr_activo
  };
};

// Helper para formatear datos del formulario para el backend
export const formatFormDataForBackend = (formData) => {
  return {
    nombre: formData.nombre,
    descripcion: formData.descripcion,
    codigoBarra: formData.codigoBarra,
    categoria: formData.categoria,
    unidadMedida: formData.unidadMedida,
    proveedor: formData.proveedor,
    precio: formData.precio ? parseFloat(formData.precio) : 0,
    stock: formData.stock ? parseInt(formData.stock) : 0,
    stockMinimo: formData.stockMinimo ? parseInt(formData.stockMinimo) : 0,
    stockMaximo: formData.stockMaximo ? parseInt(formData.stockMaximo) : 1000
  };
};