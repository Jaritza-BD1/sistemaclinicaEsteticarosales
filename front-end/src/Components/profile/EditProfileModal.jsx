// frontend/src/components/profile/EditProfileModal.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Divider,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  IconButton,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  username: Yup.string()
    .required('El nombre de usuario es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: Yup.string()
    .email('Correo inválido')
    .required('El correo es obligatorio'),
  phone: Yup.string()
    .matches(/^[0-9+\-\s()]*$/, 'Formato de teléfono inválido'),
  currentPassword: Yup.string()
    .when('changePassword', {
      is: true,
      then: Yup.string().required('La contraseña actual es obligatoria'),
    }),
  newPassword: Yup.string()
    .when('changePassword', {
      is: true,
      then: Yup.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    }),
  confirmPassword: Yup.string()
    .when('changePassword', {
      is: true,
      then: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Las contraseñas deben coincidir')
        .required('Confirma tu nueva contraseña'),
    }),
});

const EditProfileModal = ({ open, handleClose, userData, onSave }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState(null);

  const formik = useFormik({
    initialValues: {
      username: userData?.username || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      role: userData?.role || 'usuario',
      changePassword: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: userData?.twoFactorEnabled || false,
      notifications: userData?.notifications || {
        email: true,
        sms: false,
        push: true
      }
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      handleSave(values);
    },
  });

  const handleSave = (values) => {
    try {
      onSave(values);
      setNotification({ message: 'Perfil actualizado exitosamente', type: 'success', open: true });
      handleClose();
    } catch (error) {
      setNotification({ message: 'Error al actualizar el perfil', type: 'error', open: true });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleCloseModal = () => {
    formik.resetForm();
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
          border: '1px solid',
          borderColor: 'primary.200',
          minHeight: isMobile ? '100vh' : 'auto',
          maxHeight: isMobile ? '100vh' : '90vh',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        color: 'primary.main', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1,
        borderBottom: '1px solid',
        borderColor: 'primary.200',
        background: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EditIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Editar Perfil
          </Typography>
        </Box>
        <IconButton 
          onClick={handleCloseModal} 
          sx={{ 
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.50',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent 
        dividers 
        sx={{ 
          p: 3,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
            borderRadius: '4px',
            '&:hover': {
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            },
          },
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Información Básica */}
            <Grid item xs={12}>
              <Card sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                border: '1px solid',
                borderColor: 'primary.200'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Información Básica
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nombre de Usuario"
                        name="username"
                        value={formik.values.username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.username && Boolean(formik.errors.username)}
                        helperText={formik.touched.username && formik.errors.username}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: 'primary.300',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Correo Electrónico"
                        name="email"
                        type="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: 'primary.300',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Teléfono"
                        name="phone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: 'primary.300',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Rol</InputLabel>
                        <Select
                          name="role"
                          value={formik.values.role}
                          onChange={formik.handleChange}
                          label="Rol"
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              '&:hover': {
                                borderColor: 'primary.300',
                              },
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                            },
                          }}
                        >
                          <MenuItem value="usuario">Usuario</MenuItem>
                          <MenuItem value="admin">Administrador</MenuItem>
                          <MenuItem value="medico">Médico</MenuItem>
                          <MenuItem value="recepcionista">Recepcionista</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Configuración de Seguridad */}
            <Grid item xs={12}>
              <Card sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
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
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formik.values.changePassword}
                            onChange={(e) => formik.setFieldValue('changePassword', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Cambiar Contraseña"
                      />
                    </Grid>
                    
                    {formik.values.changePassword && (
                      <>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Contraseña Actual"
                            name="currentPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={formik.values.currentPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
                            helperText={formik.touched.currentPassword && formik.errors.currentPassword}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  onClick={() => setShowPassword(!showPassword)}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'primary.300',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Nueva Contraseña"
                            name="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            value={formik.values.newPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                            helperText={formik.touched.newPassword && formik.errors.newPassword}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  edge="end"
                                >
                                  {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'primary.300',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                            }}
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Confirmar Nueva Contraseña"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                            InputProps={{
                              endAdornment: (
                                <IconButton
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  edge="end"
                                >
                                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': {
                                  borderColor: 'primary.300',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'primary.main',
                                },
                              },
                            }}
                          />
                        </Grid>
                      </>
                    )}
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formik.values.twoFactorEnabled}
                            onChange={(e) => formik.setFieldValue('twoFactorEnabled', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Autenticación de Dos Factores (2FA)"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Configuración de Notificaciones */}
            <Grid item xs={12}>
              <Card sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                border: '1px solid',
                borderColor: 'primary.200'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ mr: 1 }} />
                    Configuración de Notificaciones
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formik.values.notifications.email}
                            onChange={(e) => formik.setFieldValue('notifications.email', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Notificaciones por Email"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formik.values.notifications.sms}
                            onChange={(e) => formik.setFieldValue('notifications.sms', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Notificaciones por SMS"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formik.values.notifications.push}
                            onChange={(e) => formik.setFieldValue('notifications.push', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Notificaciones Push"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 1,
        borderTop: '1px solid',
        borderColor: 'primary.200',
        background: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)'
      }}>
        <Button
          onClick={handleCloseModal}
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
          onClick={formik.handleSubmit}
          variant="contained"
          endIcon={<SaveIcon />}
          disabled={formik.isSubmitting}
          sx={{
            background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              transform: 'translateY(-1px)',
            },
            boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
          }}
        >
          {formik.isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogActions>

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
    </Dialog>
  );
};

export default EditProfileModal;