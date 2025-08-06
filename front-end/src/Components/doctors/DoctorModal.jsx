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
  Chip,
  Autocomplete
} from '@mui/material';
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

const DoctorModal = ({ open, onClose, doctor, onSave, onUpdate }) => {
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
    universidad: '',
    fecha_graduacion: '',
    experiencia_anios: '',
    estado: 'activo',
    observaciones: ''
  });
  
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);

  // Datos simulados para selectores
  const especialidades = [
    'Cardiología',
    'Dermatología',
    'Pediatría',
    'Medicina General',
    'Neurología',
    'Ginecología',
    'Oftalmología',
    'Ortopedia',
    'Urología',
    'Psiquiatría',
    'Endocrinología',
    'Gastroenterología',
    'Oncología',
    'Radiología',
    'Anestesiología',
    'Traumatología',
    'Reumatología',
    'Inmunología',
    'Hematología',
    'Nefrología'
  ];

  const universidades = [
    'Universidad Nacional Autónoma de Honduras',
    'Universidad Católica de Honduras',
    'Universidad Tecnológica de Honduras',
    'Universidad José Cecilio del Valle',
    'Universidad Pedagógica Nacional Francisco Morazán',
    'Universidad de San Pedro Sula',
    'Universidad de El Zamorano',
    'Universidad Tecnológica Centroamericana',
    'Universidad Metropolitana de Honduras',
    'Universidad Politécnica de Ingeniería'
  ];

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

  React.useEffect(() => {
    if (doctor) {
      setFormData({
        nombre: doctor.nombre || '',
        apellido: doctor.apellido || '',
        identidad: doctor.identidad || '',
        fecha_nacimiento: doctor.fecha_nacimiento || '',
        genero: doctor.genero || '',
        telefono: doctor.telefono || '',
        correo: doctor.correo || '',
        direccion: doctor.direccion || '',
        colegiado: doctor.colegiado || '',
        especialidad: doctor.especialidad || [],
        universidad: doctor.universidad || '',
        fecha_graduacion: doctor.fecha_graduacion || '',
        experiencia_anios: doctor.experiencia_anios || '',
        estado: doctor.estado || 'activo',
        observaciones: doctor.observaciones || ''
      });
    } else {
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
        universidad: '',
        fecha_graduacion: '',
        experiencia_anios: '',
        estado: 'activo',
        observaciones: ''
      });
    }
    setErrors({});
  }, [doctor, open]);

  const validateForm = () => {
    const newErrors = {};
    const hoy = new Date();
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = 'Debe tener al menos 2 caracteres';
    }
    
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    } else if (formData.apellido.length < 2) {
      newErrors.apellido = 'Debe tener al menos 2 caracteres';
    }
    
    if (!formData.identidad.trim()) {
      newErrors.identidad = 'El número de identidad es requerido';
    } else if (!/^\d{13}$/.test(formData.identidad.replace(/\D/g, ''))) {
      newErrors.identidad = 'El número de identidad debe tener 13 dígitos';
    }
    
    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
    } else {
      const fechaNac = new Date(formData.fecha_nacimiento);
      if (fechaNac >= hoy) {
        newErrors.fecha_nacimiento = 'La fecha no puede ser futura';
      } else {
        const edadMilisegundos = hoy - fechaNac;
        const edadAnios = edadMilisegundos / (1000 * 60 * 60 * 24 * 365.25);
        if (edadAnios < 23) {
          newErrors.fecha_nacimiento = 'La edad mínima es 23 años';
        }
      }
    }
    
    if (!formData.genero) {
      newErrors.genero = 'El género es requerido';
    }
    
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^[0-9+\-\s()]{8,}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }
    
    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = 'Formato de correo inválido';
    }
    
    if (!formData.colegiado.trim()) {
      newErrors.colegiado = 'El número de colegiado es requerido';
    }
    
    if (formData.especialidad.length === 0) {
      newErrors.especialidad = 'Debe seleccionar al menos una especialidad';
    }
    
    if (!formData.universidad) {
      newErrors.universidad = 'La universidad es requerida';
    }
    
    if (!formData.fecha_graduacion) {
      newErrors.fecha_graduacion = 'La fecha de graduación es requerida';
    }
    
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
    
    if (validateForm()) {
      try {
        if (doctor) {
          onUpdate({ ...formData, id: doctor.id });
        } else {
          onSave(formData);
        }
        setNotification({ message: 'Médico guardado exitosamente', type: 'success', open: true });
        onClose();
      } catch (error) {
        setNotification({ message: 'Error al guardar el médico', type: 'error', open: true });
      }
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
      universidad: '',
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
          <MedicalServicesIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {doctor ? 'Editar Médico' : 'Registrar Nuevo Médico'}
          </Typography>
        </Box>
        <IconButton 
          onClick={handleClose} 
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
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Información Personal */}
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
                background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                border: '1px solid',
                borderColor: 'primary.200'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
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
                background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                border: '1px solid',
                borderColor: 'primary.200'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
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
                        options={especialidades}
                        value={formData.especialidad}
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
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              {...getTagProps({ index })}
                              key={option}
                              label={option}
                              color="primary"
                              size="small"
                            />
                          ))
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Información Académica */}
            <Grid item xs={12}>
              <Card sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                border: '1px solid',
                borderColor: 'primary.200'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon sx={{ mr: 1 }} />
                    Información Académica
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        options={universidades}
                        value={formData.universidad}
                        onChange={(event, newValue) => {
                          setFormData(prev => ({ ...prev, universidad: newValue }));
                          if (errors.universidad) {
                            setErrors(prev => ({ ...prev, universidad: '' }));
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Universidad"
                            error={!!errors.universidad}
                            helperText={errors.universidad}
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
                        )}
                      />
                    </Grid>
                    
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
                background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                border: '1px solid',
                borderColor: 'primary.200'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>
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
        borderColor: 'primary.200',
        background: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)'
      }}>
        <Button
          onClick={handleClose}
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
          onClick={handleSubmit}
          variant="contained"
          endIcon={<SaveIcon />}
          sx={{
            background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              transform: 'translateY(-1px)',
            },
            boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
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