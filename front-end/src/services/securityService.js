import DOMPurify from 'dompurify';

// central mapping for security-related payloads
export function mapRegistrationPayload(formData) {
  // formData comes from AuthForm.formData
  const payload = {
    username: formData.atr_usuario,
    name: formData.atr_nombre_usuario,
    email: formData.atr_correo_electronico,
    password: formData.atr_contrasena,
    confirmPassword: formData.confirmPassword,
    // Keep the friendly frontend key and also add backend key for robustness
    dos_fa_enabled: Boolean(formData.dos_fa_enabled),
    atr_2fa_enabled: Boolean(formData.dos_fa_enabled)
  };
  return payload;
}

// mapRegistrationPayload is exported as a named export above
// front-end/src/services/securityService.js

// Configuración de seguridad
const SECURITY_CONFIG = {
  rateLimit: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
  },
  csrf: {
    tokenHeader: 'X-CSRF-Token',
    tokenKey: 'csrf_token'
  }
};

// Sanitización de datos
export const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return DOMPurify.sanitize(data.trim());
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
};

// Validación de CSRF
export const getCSRFToken = () => {
  return localStorage.getItem(SECURITY_CONFIG.csrf.tokenKey) || 
         document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
};

export const validateCSRF = (token) => {
  const storedToken = getCSRFToken();
  return token === storedToken;
};

// Rate Limiting
class RateLimiter {
  constructor() {
    this.attempts = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Limpiar intentos antiguos
    const recentAttempts = userAttempts.filter(
      attempt => now - attempt < SECURITY_CONFIG.rateLimit.windowMs
    );
    
    if (recentAttempts.length >= SECURITY_CONFIG.rateLimit.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key) {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Validación de permisos
export const validatePermissions = (user, action, resource) => {
  if (!user || !user.role) return false;
  
  const permissions = {
    admin: ['read', 'write', 'delete', 'create'],
    medico: ['read', 'write', 'create'],
    recepcionista: ['read', 'write'],
    usuario: ['read']
  };
  
  const userPermissions = permissions[user.role] || [];
  return userPermissions.includes(action);
};

// Validación de datos sensibles
export const validateSensitiveData = (data, type) => {
  const validators = {
    email: (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    phone: (phone) => {
      const phoneRegex = /^[+]?[0-9\s\-()]{8,15}$/;
      return phoneRegex.test(phone);
    },
    identity: (identity) => {
      const identityRegex = /^[0-9]{13}$/;
      return identityRegex.test(identity);
    },
    password: (password) => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(password);
    }
  };
  
  return validators[type] ? validators[type](data) : true;
};

// Middleware de seguridad para formularios
export const withSecurity = (formData, type = 'general') => {
  const sanitized = sanitizeInput(formData);
  
  // Validaciones específicas por tipo
  if (type === 'user') {
    if (sanitized.email && !validateSensitiveData(sanitized.email, 'email')) {
      throw new Error('Email inválido');
    }
    if (sanitized.telefono && !validateSensitiveData(sanitized.telefono, 'phone')) {
      throw new Error('Teléfono inválido');
    }
    // Mapear campo frontend legible a la forma que espera el backend
    // dos_fa_enabled -> atr_2fa_enabled
    if (sanitized.dos_fa_enabled !== undefined) {
      sanitized.atr_2fa_enabled = Boolean(sanitized.dos_fa_enabled);
      // opcional: eliminar la clave frontend para evitar duplicados
      delete sanitized.dos_fa_enabled;
    }
  }
  
  if (type === 'patient' || type === 'doctor') {
    if (sanitized.identidad && !validateSensitiveData(sanitized.identidad, 'identity')) {
      throw new Error('Identidad inválida');
    }
  }
  
  return sanitized;
};

const securityService = {
  sanitizeInput,
  getCSRFToken,
  validateCSRF,
  validatePermissions,
  validateSensitiveData,
  withSecurity,
  rateLimiter
};

export default securityService; 