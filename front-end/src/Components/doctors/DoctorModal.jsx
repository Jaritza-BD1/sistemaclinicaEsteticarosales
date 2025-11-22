import React, { useState, useEffect } from 'react';
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
  Chip,
  Autocomplete
} from '@mui/material';
import { CircularProgress } from '@mui/material';
import useEspecialidades from '../../hooks/useEspecialidades';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  MedicalServices as MedicalServicesIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Work as WorkIcon
} from '@mui/icons-material';

const DoctorModal = (props) => {
  // Support multiple prop names for backwards compatibility with different callers
  const open = props.open ?? props.show ?? false;
  const onClose = props.onClose ?? props.onHide ?? (() => {});
  const doctor = props.doctor ?? props.initialData ?? null;
  const onSave = props.onSave ?? props.onSuccess ?? null;
  const onUpdate = props.onUpdate ?? props.onSuccess ?? null;
  const onError = props.onError ?? props.onFailure ?? null;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    identidad: '',
    fecha_nacimiento: '',
    genero: '',
    telefono: '',
    correo: '',
    direccion: '',
    colegiado: '',
    especialidad: [],
    fecha_graduacion: '',
    experiencia_anios: '',
    estado: 'activo',
    observaciones: ''
  });
  
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);

  // Datos simulados para selectores
  // (Removed mock `especialidades` array - using `useEspecialidades` hook instead)
  const { options: especialidadesOptions, loading: loadingEspecialidades, error: especialidadesError } = useEspecialidades();

  const generos = [
    { value: 'masculino', label: 'Masculino' },
    { value: 'femenino', label: 'Femenino' },
    { value: 'otro', label: 'Otro' }
  ];

  const estados = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'vacaciones', label: 'Vacaciones' },
    { value: 'licencia', label: 'Licencia' }
  ];

  // If an existing doctor is provided, populate the form fields
  React.useEffect(() => {
    if (doctor) {
      setFormData({
        nombre: doctor.atr_nombre || doctor.nombre || '',
        apellido: doctor.atr_apellido || doctor.apellido || '',
        identidad: doctor.atr_identidad || doctor.identidad || '',
        fecha_nacimiento: doctor.atr_fecha_nacimiento || doctor.fecha_nacimiento || '',
        genero: doctor.atr_id_genero || doctor.genero || '',
        telefono: (doctor.telefonos && doctor.telefonos[0]?.atr_telefono) || doctor.telefono || '',
        correo: (doctor.correos && doctor.correos[0]?.atr_correo) || doctor.correo || '',
        direccion: (doctor.direcciones && doctor.direcciones[0]?.atr_direccion_completa) || doctor.direccion || '',
        colegiado: doctor.atr_numero_colegiado || doctor.colegiado || '',
        especialidad: (doctor.Especialidades || doctor.especialidades || []).map(e => e.atr_especialidad || e.name || e) || [],
        fecha_graduacion: doctor.fecha_graduacion || '',
        experiencia_anios: doctor.experiencia_anios || '',
        estado: doctor.estado || 'activo',
        observaciones: doctor.observaciones || ''
      });
    }
  }, [doctor, especialidadesOptions]);

  const validateForm = () => {
    const newErrors = {};
    const hoy = new Date();

    if (!formData.identidad || !formData.identidad.toString().trim()) {
      newErrors.identidad = 'El número de identidad es requerido';
    } else if (!/^\d{13}$/.test(formData.identidad.toString().replace(/\D/g, ''))) {
      newErrors.identidad = 'El número de identidad debe tener 13 dígitos';
    }

    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    } else {
      const fechaNac = new Date(formData.fecha_nacimiento);
      if (fechaNac >= hoy) {
        newErrors.fecha_nacimiento = 'La fecha no puede ser futura';
      } else {
        const edadAnios = (hoy - fechaNac) / (1000 * 60 * 60 * 24 * 365.25);
        if (edadAnios < 23) newErrors.fecha_nacimiento = 'La edad mínima es 23 años';
      }
    }

    if (!formData.genero) newErrors.genero = 'El género es requerido';

    if (!formData.telefono || !formData.telefono.toString().trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^[0-9+\-\s()]{8,}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }

    if (!formData.correo || !formData.correo.toString().trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Formato de correo inválido';
    }

    if (!formData.colegiado || !formData.colegiado.toString().trim()) newErrors.colegiado = 'El número de colegiado es requerido';

    if (!formData.especialidad || formData.especialidad.length === 0) newErrors.especialidad = 'Debe seleccionar al menos una especialidad';
    if (!formData.fecha_graduacion) newErrors.fecha_graduacion = 'La fecha de graduación es requerida';

    if (formData.experiencia_anios && (isNaN(formData.experiencia_anios) || formData.experiencia_anios < 0)) {
      newErrors.experiencia_anios = 'Los años de experiencia deben ser un número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const especialidadIds = (formData.especialidad || []).map(v => {
        if (typeof v === 'string') {
          const found = especialidadesOptions.find(o => o.name === v);
          return found ? found.id : null;
        }
        if (v && (v.id || v.atr_id_especialidad)) return v.id || v.atr_id_especialidad;
        return null;
      }).filter(Boolean);

      const payload = { ...formData, especialidad: especialidadIds };

      // Call whichever success handler exists (onUpdate/onSave/onSuccess)
      if (doctor) {
        if (onUpdate) onUpdate({ ...payload, id: doctor.id });
        if (onSave) onSave({ ...payload, id: doctor.id });
        if (props.onSuccess) props.onSuccess({ ...payload, id: doctor.id });
      } else {
        if (onSave) onSave(payload);
        if (props.onSuccess) props.onSuccess(payload);
      }

      setNotification({ message: 'Médico guardado exitosamente', type: 'success', open: true });
      onClose();
    } catch (err) {
      setNotification({ message: 'Error al guardar el médico', type: 'error', open: true });
      if (onError) onError(err);
      if (props.onError) props.onError(err);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      apellido: '',
      identidad: '',
      fecha_nacimiento: '',
      genero: '',
      telefono: '',
      correo: '',
      direccion: '',
      colegiado: '',
      especialidad: [],
      fecha_graduacion: '',
      experiencia_anios: '',
      estado: 'activo',
      observaciones: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          backgroundColor: 'background.paper',
          color: 'accent.main',
          border: '1px solid',
          borderColor: 'brand.paleL2',
          minHeight: isMobile ? '100vh' : 'auto',
          maxHeight: isMobile ? '100vh' : '90vh',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        color: 'accent.main', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1,
        borderBottom: '1px solid',
        borderColor: 'brand.paleL2',
        backgroundColor: 'background.paper'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MedicalServicesIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {doctor ? 'Editar Médico' : 'Registrar Nuevo Médico'}
          </Typography>
        </Box>
        <IconButton 
          onClick={handleClose} 
          sx={{ 
            color: 'accent.main',
            '&:hover': {
              backgroundColor: 'brand.paleL3',
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
          backgroundColor: 'background.paper',
          color: 'accent.main',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'brand.pale',
            borderRadius: '4px',
            '&:hover': {
              background: 'brand.paleDark',
            },
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Información Personal */}
            <Grid item xs={12}>
              <Card sx={{ 
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'brand.paleL2'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'accent.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Información Personal
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nombre(s)"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        error={!!errors.nombre}
                        helperText={errors.nombre}
                        required
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
                        label="Apellido(s)"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        error={!!errors.apellido}
                        helperText={errors.apellido}
                        required
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
                        label="Número de Identidad"
                        name="identidad"
                        value={formData.identidad}
                        onChange={handleChange}
                        error={!!errors.identidad}
                        helperText={errors.identidad}
                        required
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
                        label="Fecha de Nacimiento"
                        name="fecha_nacimiento"
                        type="date"
                        value={formData.fecha_nacimiento}
                        onChange={handleChange}
                        error={!!errors.fecha_nacimiento}
                        helperText={errors.fecha_nacimiento}
                        required
                        InputLabelProps={{ shrink: true }}
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
                      <FormControl fullWidth required error={!!errors.genero}>
                        <InputLabel>Género</InputLabel>
                        <Select
                          name="genero"
                          value={formData.genero}
                          onChange={handleChange}
                          label="Género"
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
                          {generos.map((genero) => (
                            <MenuItem key={genero.value} value={genero.value}>
                              {genero.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Estado</InputLabel>
                        <Select
                          name="estado"
                          value={formData.estado}
                          onChange={handleChange}
                          label="Estado"
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
                          {estados.map((estado) => (
                            <MenuItem key={estado.value} value={estado.value}>
                              {estado.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Información de Contacto */}
            <Grid item xs={12}>
              <Card sx={{ 
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'brand.paleL2'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'accent.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ mr: 1 }} />
                    Información de Contacto
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Teléfono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        error={!!errors.telefono}
                        helperText={errors.telefono}
                        required
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
                        name="correo"
                        type="email"
                        value={formData.correo}
                        onChange={handleChange}
                        error={!!errors.correo}
                        helperText={errors.correo}
                        required
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
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Dirección"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        multiline
                        rows={2}
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
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Información Profesional */}
            <Grid item xs={12}>
              <Card sx={{ 
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'brand.paleL2'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'accent.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <WorkIcon sx={{ mr: 1 }} />
                    Información Profesional
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Número de Colegiado"
                        name="colegiado"
                        value={formData.colegiado}
                        onChange={handleChange}
                        error={!!errors.colegiado}
                        helperText={errors.colegiado}
                        required
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
                        label="Años de Experiencia"
                        name="experiencia_anios"
                        type="number"
                        value={formData.experiencia_anios}
                        onChange={handleChange}
                        error={!!errors.experiencia_anios}
                        helperText={errors.experiencia_anios}
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
                    
                    <Grid item xs={12}>
                        <Autocomplete
                          multiple
                          options={especialidadesOptions}
                          getOptionLabel={(opt) => opt.name}
                          value={(Array.isArray(formData.especialidad) ? formData.especialidad.map(v => {
                            if (typeof v === 'string') return especialidadesOptions.find(o => o.name === v);
                            if (v && (v.id || v.atr_id_especialidad)) return especialidadesOptions.find(o => o.id === (v.id || v.atr_id_especialidad));
                            return null;
                          }).filter(Boolean) : [])}
                          onChange={(event, newValue) => {
                            setFormData(prev => ({ ...prev, especialidad: newValue }));
                            if (errors.especialidad) {
                              setErrors(prev => ({ ...prev, especialidad: '' }));
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Especialidades"
                              error={!!errors.especialidad}
                              helperText={errors.especialidad}
                              required
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
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {loadingEspecialidades ? <CircularProgress size={18} style={{ marginRight: 8 }} /> : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                )
                              }}
                            />
                          )}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                {...getTagProps({ index })}
                                key={option.id}
                                label={option.name}
                                color="primary"
                                size="small"
                              />
                            ))
                          }
                        />
                        {especialidadesError && (
                          <Typography variant="caption" color="error">
                            Error cargando especialidades: {especialidadesError}
                          </Typography>
                        )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Información Académica */}
            <Grid item xs={12}>
              <Card sx={{ 
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'brand.paleL2'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'accent.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon sx={{ mr: 1 }} />
                    Información Académica
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Fecha de Graduación"
                        name="fecha_graduacion"
                        type="date"
                        value={formData.fecha_graduacion}
                        onChange={handleChange}
                        error={!!errors.fecha_graduacion}
                        helperText={errors.fecha_graduacion}
                        required
                        InputLabelProps={{ shrink: true }}
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
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Observaciones */}
            <Grid item xs={12}>
              <Card sx={{ 
                borderRadius: 2,
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'brand.paleL2'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'accent.main', mb: 2 }}>
                    Observaciones
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <TextField
                    fullWidth
                    label="Observaciones"
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="Observaciones adicionales sobre el médico..."
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
        borderColor: 'brand.paleL2',
        backgroundColor: 'background.paper',
        color: 'accent.main'
      }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderColor: 'brand.paleL2',
            color: 'accent.main',
            '&:hover': {
              borderColor: 'accent.main',
              backgroundColor: 'brand.paleL3',
            },
          }}
        >
          Cancelar
        </Button>
        
        <Button
          onClick={handleSubmit}
          variant="contained"
          endIcon={<SaveIcon />}
          sx={{
            backgroundColor: 'brand.pale',
            color: 'accent.main',
            '&:hover': {
              backgroundColor: 'brand.paleDark',
              transform: 'translateY(-1px)',
            },
            boxShadow: '0 4px 14px 0 rgba(33,40,69,0.06)',
          }}
        >
          {doctor ? 'Actualizar Médico' : 'Registrar Médico'}
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

export default DoctorModal; 