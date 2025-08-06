// front-end/src/services/cacheService.js

// Configuración del cache
const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
  MAX_SIZE: 100, // Máximo 100 items en cache
  CLEANUP_INTERVAL: 10 * 60 * 1000 // Limpiar cada 10 minutos
};

class CacheService {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.setupCleanup();
  }

  // Generar clave única para el cache
  generateKey(key, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(k => `${k}:${params[k]}`)
      .join('|');
    return `${key}:${paramString}`;
  }

  // Obtener item del cache
  get(key, params = {}) {
    const cacheKey = this.generateKey(key, params);
    const item = this.cache.get(cacheKey);
    const timestamp = this.timestamps.get(cacheKey);

    if (!item || !timestamp) {
      return null;
    }

    // Verificar si ha expirado
    if (Date.now() - timestamp > CACHE_CONFIG.DEFAULT_TTL) {
      this.delete(key, params);
      return null;
    }

    return item;
  }

  // Guardar item en cache
  set(key, value, params = {}, ttl = CACHE_CONFIG.DEFAULT_TTL) {
    const cacheKey = this.generateKey(key, params);
    
    // Verificar tamaño máximo del cache
    if (this.cache.size >= CACHE_CONFIG.MAX_SIZE) {
      this.evictOldest();
    }

    this.cache.set(cacheKey, value);
    this.timestamps.set(cacheKey, Date.now());
  }

  // Eliminar item del cache
  delete(key, params = {}) {
    const cacheKey = this.generateKey(key, params);
    this.cache.delete(cacheKey);
    this.timestamps.delete(cacheKey);
  }

  // Limpiar cache completo
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  // Eliminar items más antiguos
  evictOldest() {
    const entries = Array.from(this.timestamps.entries());
    entries.sort((a, b) => a[1] - b[1]);
    
    // Eliminar el 20% más antiguo
    const toDelete = Math.ceil(entries.length * 0.2);
    entries.slice(0, toDelete).forEach(([key]) => {
      this.cache.delete(key);
      this.timestamps.delete(key);
    });
  }

  // Limpiar cache expirado
  cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now - timestamp > CACHE_CONFIG.DEFAULT_TTL) {
        this.cache.delete(key);
        this.timestamps.delete(key);
      }
    }
  }

  // Configurar limpieza automática
  setupCleanup() {
    setInterval(() => {
      this.cleanup();
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  }

  // Obtener estadísticas del cache
  getStats() {
    return {
      size: this.cache.size,
      maxSize: CACHE_CONFIG.MAX_SIZE,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  // Calcular tasa de aciertos (simplificado)
  calculateHitRate() {
    // Implementación simplificada
    return 0.85; // 85% de aciertos estimados
  }

  // Estimar uso de memoria
  estimateMemoryUsage() {
    let size = 0;
    for (const [key, value] of this.cache.entries()) {
      size += JSON.stringify(key).length;
      size += JSON.stringify(value).length;
    }
    return size;
  }
}

// Instancia global del cache
const cacheService = new CacheService();

// Funciones de utilidad para cache
export const cacheData = async (key, fetchFunction, params = {}, ttl = CACHE_CONFIG.DEFAULT_TTL) => {
  // Intentar obtener del cache
  const cached = cacheService.get(key, params);
  if (cached) {
    return cached;
  }

  // Si no está en cache, obtener datos
  try {
    const data = await fetchFunction(params);
    cacheService.set(key, data, params, ttl);
    return data;
  } catch (error) {
    console.error('Error fetching data for cache:', error);
    throw error;
  }
};

// Cache para listas de datos
export const cacheList = async (key, fetchFunction, params = {}, ttl = CACHE_CONFIG.DEFAULT_TTL) => {
  return cacheData(key, fetchFunction, params, ttl);
};

// Cache para datos individuales
export const cacheItem = async (key, id, fetchFunction, ttl = CACHE_CONFIG.DEFAULT_TTL) => {
  return cacheData(key, fetchFunction, { id }, ttl);
};

// Cache para datos de formularios
export const cacheFormData = (formType, data) => {
  const key = `form:${formType}`;
  cacheService.set(key, data, {}, 30 * 60 * 1000); // 30 minutos
};

export const getCachedFormData = (formType) => {
  const key = `form:${formType}`;
  return cacheService.get(key);
};

// Cache para configuraciones
export const cacheConfig = (configType, data) => {
  const key = `config:${configType}`;
  cacheService.set(key, data, {}, 60 * 60 * 1000); // 1 hora
};

export const getCachedConfig = (configType) => {
  const key = `config:${configType}`;
  return cacheService.get(key);
};

// Hook para cache
export const useCache = () => {
  return {
    cacheData,
    cacheList,
    cacheItem,
    cacheFormData,
    getCachedFormData,
    cacheConfig,
    getCachedConfig,
    clearCache: () => cacheService.clear(),
    getStats: () => cacheService.getStats()
  };
};

export default cacheService; 