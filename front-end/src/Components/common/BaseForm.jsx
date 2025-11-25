// front-end/src/Components/common/BaseForm.jsx
import React, { createContext, useContext, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import useFormValidation from '../../hooks/useFormValidation';
import { validatePermissions } from '../../services/securityService';

// Context para el formulario
const FormContext = createContext();

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext debe usarse dentro de BaseForm');
  }
  
  // Validar que el contexto tenga las propiedades necesarias
  if (!context.formData || !context.errors || !context.handleChange) {
    console.error('FormContext is missing required properties:', context);
    throw new Error('FormContext is not properly initialized');
  }
  
  return context;
};

const BaseForm = ({
  children,
  title,
  subtitle,
  validationSchema,
  initialData = {},
  formType = 'general',
  onSubmit,
  onCancel,
  onSuccess,
  loading = false,
  error = null,
  success = null,
  user = null,
  requiredPermissions = [],
  showHeader = true,
  showActions = true,
  maxWidth = 'md',
  elevation = 2,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Validar permisos del usuario
  const hasPermissions = useMemo(() => {
    if (!user || requiredPermissions.length === 0) return true;
    
    return requiredPermissions.every(permission => {
      const [action, resource] = permission.split(':');
      return validatePermissions(user, action, resource);
    });
  }, [user, requiredPermissions]);

  // Hook de validación del formulario
  const form = useFormValidation(validationSchema, initialData, formType);

  // Manejar envío del formulario
  const handleSubmit = async (data) => {
    if (!hasPermissions) {
      form.setErrors({ general: 'No tienes permisos para realizar esta acción' });
      return;
    }

    try {
      const result = await onSubmit(data);
      if (onSuccess) {
        onSuccess(result);
      }
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
      
      form.setErrors({ general: errorMessage });
      throw error;
    }
  };



  // Contexto del formulario
  const formContext = {
    ...form,
    hasPermissions,
    isMobile,
    theme
  };

  // Si no tiene permisos, mostrar mensaje
  if (!hasPermissions) {
    return (
      <Paper
        elevation={elevation}
        sx={{
          p: 3,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
          border: '1px solid',
          borderColor: 'error.main',
          ...sx
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          No tienes permisos para acceder a este formulario
        </Alert>
        <Typography variant="body1" color="text.secondary">
          Contacta al administrador si necesitas acceso
        </Typography>
      </Paper>
    );
  }

  return (
    <FormContext.Provider value={formContext}>
      <Paper
        elevation={elevation}
        sx={{
          maxWidth: maxWidth,
          mx: 'auto',
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
          border: '1px solid',
          borderColor: 'primary.200',
          borderRadius: 3,
          overflow: 'hidden',
          ...sx
        }}
        {...props}
      >
        {/* Header del formulario */}
        {showHeader && (title || subtitle) && (
          <Box
            sx={{
              p: 3,
              pb: 2,
              background: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)',
              borderBottom: '1px solid',
              borderColor: 'primary.200'
            }}
          >
            {title && (
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  textAlign: isMobile ? 'center' : 'left',
                  mb: subtitle ? 1 : 0
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  textAlign: isMobile ? 'center' : 'left'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        {/* Contenido del formulario */}
        <Box sx={{ p: 3 }}>
          {/* Estados de carga y error */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <CircularProgress size={40} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {typeof error === 'string' ? error : 'Error desconocido'}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {form.errors.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {form.errors.general}
            </Alert>
          )}

          {/* Formulario */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // form.handleSubmit returns a Promise when called with the onSubmit
              // handler. Do not attempt to invoke the return value as a function.
              form.handleSubmit(handleSubmit);
            }}
            noValidate
          >
            {children}
          </form>
        </Box>
      </Paper>
    </FormContext.Provider>
  );
};

export default BaseForm; 