import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Divider,
  useTheme,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Save as SaveIcon,
  Person as PersonIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import BaseForm from '../common/BaseForm';
import { FormTextField, FormPasswordField, FormSelectField, FormSwitchField } from '../common/FormFields';
import { userSchema } from '../../services/validationSchemas';
import { withSecurity } from '../../services/securityService';

const UserForm = ({ initialData = {}, onSuccess }) => {

  const [notification, setNotification] = useState(null);

  // Datos simulados para selectores
  const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'medico', label: 'Médico' },
    { value: 'recepcionista', label: 'Recepcionista' },
    { value: 'usuario', label: 'Usuario' }
  ];

  const handleSubmit = async (data) => {
    try {
      // Sanitización y validación de seguridad
      const sanitizedData = withSecurity(data, 'user');
      
      // Aquí iría la lógica para enviar los datos a la API
      console.log('Datos del usuario:', sanitizedData);
      
      setNotification({ 
        message: 'Usuario guardado exitosamente!', 
        type: 'success', 
        open: true 
      });
      
      if (onSuccess) {
        onSuccess(sanitizedData);
      }
      
      return sanitizedData;
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      throw error;
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <BaseForm
        title="Gestión de Usuario"
        subtitle="Crear o editar información de usuario del sistema"
        validationSchema={userSchema}
        initialData={initialData}
        formType="user"
        onSubmit={handleSubmit}
        requiredPermissions={['write:users']}
        maxWidth="md"
      >
        <Grid container spacing={3}>
          {/* Información Personal */}
          <Grid item xs={12}>
            <Card sx={{ 
              borderRadius: 2,
              backgroundColor: '#FCE4EC',
              border: '1px solid',
              borderColor: 'primary.200'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  Información Personal
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormTextField
                      name="username"
                      label="Nombre de Usuario"
                      required
                      placeholder="Ingresa el nombre de usuario"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormTextField
                      name="email"
                      label="Correo Electrónico"
                      type="email"
                      required
                      placeholder="usuario@ejemplo.com"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormTextField
                      name="nombre"
                      label="Nombre"
                      required
                      placeholder="Ingresa el nombre"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormTextField
                      name="apellido"
                      label="Apellido"
                      required
                      placeholder="Ingresa el apellido"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormTextField
                      name="telefono"
                      label="Teléfono"
                      placeholder="+504 1234-5678"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormSelectField
                      name="rol"
                      label="Rol"
                      options={roles}
                      required
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Configuración de Seguridad */}
          <Grid item xs={12}>
            <Card sx={{ 
              borderRadius: 2,
              backgroundColor: '#FCE4EC',
              border: '1px solid',
              borderColor: 'primary.200'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 1 }} />
                  Configuración de Seguridad
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormPasswordField
                      name="password"
                      label="Contraseña"
                      required={!initialData.id}
                      placeholder="Ingresa la contraseña"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormPasswordField
                      name="confirmPassword"
                      label="Confirmar Contraseña"
                      required={!initialData.id}
                      placeholder="Confirma la contraseña"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="activo"
                          defaultChecked={initialData.activo !== undefined ? initialData.activo : true}
                        />
                      }
                      label="Usuario Activo"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    {/* Usar campo controlado FormSwitchField para mapear al contexto del formulario */}
                    <FormSwitchField
                      name="dos_fa_enabled"
                      label="Autenticación de Dos Factores (2FA)"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Acciones */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'primary.200'
            }}>
              <Button
                variant="outlined"
                sx={{
                  borderColor: 'primary.300',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.50',
                  },
                }}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                endIcon={<SaveIcon />}
                sx={{
                  backgroundColor: '#FCE4EC',
                  color: '#212845',
                  '&:hover': {
                    backgroundColor: '#F8BBD0',
                  },
                  boxShadow: 'none',
                }}
              >
                Guardar Usuario
              </Button>
            </Box>
          </Grid>
        </Grid>
      </BaseForm>

      <Snackbar
        open={notification?.open || false}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification?.type || 'info'}
          sx={{ borderRadius: 2 }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserForm; 