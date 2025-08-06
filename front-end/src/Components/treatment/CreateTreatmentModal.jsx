import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
  Autocomplete,
  Chip,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon,
  MedicalServices as MedicalIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckIcon,
  Add as AddIcon
} from '@mui/icons-material';

const CreateTreatmentModal = ({ open, onClose, onSave }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({
    nombre_tratamiento: '',
    descripcion: '',
    tipo_tratamiento: '',
    duracion: '',
    frecuencia: '',
    costo: '',
    paciente: '',
    medico: '',
    fecha_inicio: '',
    fecha_fin: '',
    observaciones: '',
    estado: 'activo'
  });

  const [notification, setNotification] = useState(null);

  // Datos simulados para selectores
  const tiposTratamiento = [
    'Fisioterapia',
    'Farmacológico',
    'Quirúrgico',
    'Psicoterapia',
    'Rehabilitación',
    'Terapia Ocupacional',
    'Terapia del Lenguaje',
    'Terapia Respiratoria',
    'Terapia Cardiaca',
    'Terapia Neurológica',
    'Otro'
  ];

  const frecuencias = [
    'Diario',
    'Dos veces por semana',
    'Tres veces por semana',
    'Semanal',
    'Quincenal',
    'Mensual',
    'Según necesidad',
    'Continuo'
  ];

  const estados = [
    { value: 'activo', label: 'Activo' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'completado', label: 'Completado' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'suspendido', label: 'Suspendido' }
  ];

  const pacientes = [
    { id: 1, nombre: 'María Rodríguez', identidad: '0801199501234' },
    { id: 2, nombre: 'Carlos Pérez', identidad: '0802199405678' },
    { id: 3, nombre: 'Ana Martínez', identidad: '0803199309012' }
  ];

  const medicos = [
    { id: 1, nombre: 'Dr. Juan López', especialidad: 'Medicina General' },
    { id: 2, nombre: 'Dra. Sofía García', especialidad: 'Cardiología' },
    { id: 3, nombre: 'Dr. Miguel Torres', especialidad: 'Dermatología' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length === 0) {
      setNotification({ 
        message: 'Tratamiento creado exitosamente!', 
        type: 'success', 
        open: true 
      });
      
      // Aquí iría la lógica para enviar los datos a la API
      console.log('Datos del tratamiento:', formData);
      
      if (onSave) {
        onSave(formData);
      }
      
      // Limpiar formulario y cerrar modal
      setTimeout(() => {
        setFormData({
          nombre_tratamiento: '',
          descripcion: '',
          tipo_tratamiento: '',
          duracion: '',
          frecuencia: '',
          costo: '',
          paciente: '',
          medico: '',
          fecha_inicio: '',
          fecha_fin: '',
          observaciones: '',
          estado: 'activo'
        });
        onClose();
      }, 1500);
    } else {
      setNotification({ 
        message: 'Por favor, complete todos los campos requeridos', 
        type: 'error', 
        open: true 
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre_tratamiento.trim()) {
      errors.nombre_tratamiento = 'El nombre del tratamiento es requerido';
    }
    
    if (!formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es requerida';
    }
    
    if (!formData.tipo_tratamiento) {
      errors.tipo_tratamiento = 'El tipo de tratamiento es requerido';
    }
    
    if (!formData.duracion.trim()) {
      errors.duracion = 'La duración es requerida';
    }
    
    if (!formData.frecuencia) {
      errors.frecuencia = 'La frecuencia es requerida';
    }
    
    if (!formData.costo.trim()) {
      errors.costo = 'El costo es requerido';
    }
    
    if (!formData.paciente) {
      errors.paciente = 'El paciente es requerido';
    }
    
    if (!formData.medico) {
      errors.medico = 'El médico es requerido';
    }
    
    if (!formData.fecha_inicio) {
      errors.fecha_inicio = 'La fecha de inicio es requerida';
    }
    
    return errors;
  };

  const handleClose = () => {
    setFormData({
      nombre_tratamiento: '',
      descripcion: '',
      tipo_tratamiento: '',
      duracion: '',
      frecuencia: '',
      costo: '',
      paciente: '',
      medico: '',
      fecha_inicio: '',
      fecha_fin: '',
      observaciones: '',
      estado: 'activo'
    });
    onClose();
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            border: '1px solid',
            borderColor: 'primary.200'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'primary.main', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MedicalIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Crear Nuevo Tratamiento</Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'primary.main' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Información Básica del Tratamiento */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                      <MedicalIcon sx={{ mr: 1 }} />
                      Información del Tratamiento
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nombre del Tratamiento"
                          name="nombre_tratamiento"
                          value={formData.nombre_tratamiento}
                          onChange={handleChange}
                          required
                          placeholder="Ej: Terapia de Rehabilitación"
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
                        <FormControl fullWidth required>
                          <InputLabel>Tipo de Tratamiento</InputLabel>
                          <Select
                            name="tipo_tratamiento"
                            value={formData.tipo_tratamiento}
                            onChange={handleChange}
                            label="Tipo de Tratamiento"
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
                            {tiposTratamiento.map((tipo) => (
                              <MenuItem key={tipo} value={tipo}>
                                {tipo}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Descripción"
                          name="descripcion"
                          value={formData.descripcion}
                          onChange={handleChange}
                          required
                          multiline
                          rows={3}
                          placeholder="Descripción detallada del tratamiento, objetivos, metodología..."
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

              {/* Detalles del Tratamiento */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                      <DescriptionIcon sx={{ mr: 1 }} />
                      Detalles del Tratamiento
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Duración"
                          name="duracion"
                          value={formData.duracion}
                          onChange={handleChange}
                          required
                          placeholder="Ej: 6 semanas"
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
                        <FormControl fullWidth required>
                          <InputLabel>Frecuencia</InputLabel>
                          <Select
                            name="frecuencia"
                            value={formData.frecuencia}
                            onChange={handleChange}
                            label="Frecuencia"
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
                            {frecuencias.map((freq) => (
                              <MenuItem key={freq} value={freq}>
                                {freq}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Costo"
                          name="costo"
                          value={formData.costo}
                          onChange={handleChange}
                          required
                          placeholder="Ej: $500.00"
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

              {/* Información del Paciente y Médico */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1 }} />
                      Paciente y Médico Responsable
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          options={pacientes}
                          getOptionLabel={(option) => `${option.nombre} - ${option.identidad}`}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Paciente"
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
                          onChange={(event, newValue) => {
                            setFormData(prev => ({
                              ...prev,
                              paciente: newValue ? newValue.id : ''
                            }));
                          }}
                          renderOption={(props, option) => (
                            <Box component="li" {...props}>
                              <Box>
                                <Typography variant="body1">{option.nombre}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {option.identidad}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Autocomplete
                          options={medicos}
                          getOptionLabel={(option) => `${option.nombre} - ${option.especialidad}`}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Médico Responsable"
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
                          onChange={(event, newValue) => {
                            setFormData(prev => ({
                              ...prev,
                              medico: newValue ? newValue.id : ''
                            }));
                          }}
                          renderOption={(props, option) => (
                            <Box component="li" {...props}>
                              <Box>
                                <Typography variant="body1">{option.nombre}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {option.especialidad}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Fechas y Observaciones */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 1 }} />
                      Fechas y Observaciones
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Fecha de Inicio"
                          name="fecha_inicio"
                          type="date"
                          value={formData.fecha_inicio}
                          onChange={handleChange}
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
                        <TextField
                          fullWidth
                          label="Fecha de Finalización"
                          name="fecha_fin"
                          type="date"
                          value={formData.fecha_fin}
                          onChange={handleChange}
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
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Observaciones"
                          name="observaciones"
                          value={formData.observaciones}
                          onChange={handleChange}
                          multiline
                          rows={3}
                          placeholder="Observaciones adicionales, notas especiales, contraindicaciones..."
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
            </Grid>
          </form>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
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
            Crear Tratamiento
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification?.open || false}
        autoHideDuration={6000}
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

export default CreateTreatmentModal;