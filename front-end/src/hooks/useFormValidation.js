// front-end/src/hooks/useFormValidation.js
import { useState, useCallback, useRef } from 'react';
import { withSecurity, rateLimiter } from '../services/securityService';

const useFormValidation = (validationSchema, initialData = {}, formType = 'general') => {
  // Validar que initialData sea un objeto
  const safeInitialData = initialData && typeof initialData === 'object' ? initialData : {};
  
  const [formData, setFormData] = useState(safeInitialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const submitAttempts = useRef(0);
  
  // Validación con sanitización
  const validate = useCallback(async (data = formData) => {
    setIsValidating(true);
    setErrors({});
    
    try {
      // Sanitización de datos
      const sanitizedData = withSecurity(data, formType);
      
      // Validación con schema
      if (validationSchema) {
        await validationSchema.validate(sanitizedData, { abortEarly: false });
      }
      
      setIsValidating(false);
      return { isValid: true, data: sanitizedData };
    } catch (validationErrors) {
      const newErrors = {};
      
      if (validationErrors.inner) {
        // Errores de Yup
        validationErrors.inner.forEach(error => {
          newErrors[error.path] = error.message;
        });
      } else if (validationErrors.message) {
        // Errores de sanitización
        newErrors.general = validationErrors.message;
      }
      
      setErrors(newErrors);
      setIsValidating(false);
      return { isValid: false, errors: newErrors };
    }
  }, [formData, validationSchema, formType]);
  
  // Manejo de cambios con validación en tiempo real
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);
  
  // Manejo de cambios dinámicos (para arrays)
  const handleDynamicChange = useCallback((type, id, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  }, []);
  
  // Agregar campo dinámico
  const addDynamicField = useCallback((type, template = {}) => {
    setFormData(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), { 
        id: Date.now(), 
        ...template 
      }]
    }));
  }, []);
  
  // Remover campo dinámico
  const removeDynamicField = useCallback((type, id) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== id)
    }));
  }, []);
  
  // Envío del formulario con rate limiting
  const handleSubmit = useCallback(async (onSubmit, options = {}) => {
    const { enableRateLimit = true } = options;
    
    if (enableRateLimit) {
      const userKey = `form_submit_${formType}`;
      if (!rateLimiter.isAllowed(userKey)) {
        setErrors({ general: 'Demasiados intentos. Intente más tarde.' });
        return;
      }
    }
    
    setIsSubmitting(true);
    submitAttempts.current += 1;
    
    try {
      const validation = await validate();
      
      if (!validation.isValid) {
        setIsSubmitting(false);
        return;
      }
      
      // Llamar a la función de envío
      const result = await onSubmit(validation.data);
      
      // Resetear rate limiter en éxito
      if (enableRateLimit) {
        rateLimiter.reset(`form_submit_${formType}`);
      }
      
      setIsSubmitting(false);
      return result;
      
    } catch (error) {
      console.error('Error en envío del formulario:', error);
      
      // Manejar diferentes tipos de error
      let errorMessage = 'Error al enviar el formulario';
      
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        } else if (error.toString) {
          errorMessage = error.toString();
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setErrors({ general: errorMessage });
      setIsSubmitting(false);
    }
  }, [validate, formType]);
  
  // Resetear formulario
  const resetForm = useCallback((newData = initialData) => {
    // Validar que newData sea un objeto
    const safeNewData = newData && typeof newData === 'object' ? newData : {};
    setFormData(safeNewData);
    setErrors({});
    setIsSubmitting(false);
    setIsValidating(false);
    submitAttempts.current = 0;
  }, [initialData]);
  
  // Validación de campo específico
  const validateField = useCallback(async (fieldName) => {
    const fieldValue = formData[fieldName];
    const fieldData = { [fieldName]: fieldValue };
    
    try {
      if (validationSchema) {
        await validationSchema.validateAt(fieldName, fieldData);
        setErrors(prev => ({ ...prev, [fieldName]: '' }));
        return true;
      }
    } catch (error) {
      // Manejar diferentes tipos de error
      let errorMessage = 'Campo inválido';
      
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        } else if (error.toString) {
          errorMessage = error.toString();
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setErrors(prev => ({ ...prev, [fieldName]: errorMessage }));
      return false;
    }
  }, [formData, validationSchema]);
  
  // Validación en tiempo real con debounce
  const debouncedValidate = useCallback((func, delay = 500) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);
  
  const debouncedFieldValidation = useCallback(
    debouncedValidate(validateField, 300),
    [validateField, debouncedValidate]
  );
  
  return {
    // Estados
    formData,
    errors,
    isSubmitting,
    isValidating,
    
    // Funciones principales
    handleChange,
    handleDynamicChange,
    addDynamicField,
    removeDynamicField,
    handleSubmit,
    validate,
    validateField,
    debouncedFieldValidation,
    resetForm,
    
    // Utilidades
    hasErrors: Object.keys(errors).length > 0,
    isFormValid: Object.keys(errors).length === 0 && !isValidating,
    submitAttempts: submitAttempts.current
  };
};

export default useFormValidation; 