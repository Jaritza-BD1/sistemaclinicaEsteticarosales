import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
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
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Medication as MedicationIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  LocalPharmacy as PharmacyIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

const FormularioMedicamentos = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({
    nombre_medicamento: '',
    descripcion: '',
    receta: '',
    fecha_receta: '',
    tipo_medicamento: '',
    dosis: '',
    frecuencia: '',
    duracion: '',
    paciente: '',
    medico: ''
  });

  const [notification, setNotification] = useState(null);

  // Datos simulados para selectores
  const tiposMedicamento = [
    'Analgésico',
    'Antiinflamatorio',
    'Antibiótico',
    'Antihistamínico',
    'Antiemético',
    'Antipirético',
    'Antitusivo',
    'Expectorante',
    'Laxante',
    'Antiespasmódico',
    'Otro'
  ];

  const frecuencias = [
    'Una vez al día',
    'Dos veces al día',
    'Tres veces al día',
    'Cada 6 horas',
    'Cada 8 horas',
    'Cada 12 horas',
    'Según necesidad',
    'Antes de las comidas',
    'Después de las comidas',
    'Con las comidas'
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
    setNotification({ 
      message: 'Receta registrada exitosamente!', 
      type: 'success', 
      open: true 
    });
    
    // Aquí iría la lógica para enviar los datos a la API
    console.log('Datos enviados:', formData);
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre_medicamento.trim()) {
      errors.nombre_medicamento = 'El nombre del medicamento es requerido';
    }
    
    if (!formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es requerida';
    }
    
    if (!formData.receta.trim()) {
      errors.receta = 'La receta es requerida';
    }
    
    if (!formData.fecha_receta) {
      errors.fecha_receta = 'La fecha de receta es requerida';
    }
    
    if (!formData.tipo_medicamento) {
      errors.tipo_medicamento = 'El tipo de medicamento es requerido';
    }
    
    if (!formData.dosis.trim()) {
      errors.dosis = 'La dosis es requerida';
    }
    
    if (!formData.frecuencia) {
      errors.frecuencia = 'La frecuencia es requerida';
    }
    
    if (!formData.duracion.trim()) {
      errors.duracion = 'La duración del tratamiento es requerida';
    }
    
    return errors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (Object.keys(errors).length === 0) {
      handleSubmit(e);
    } else {
      setNotification({ 
        message: 'Por favor, complete todos los campos requeridos', 
        type: 'error', 
        open: true 
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: 'primary.main', mb: 1 }}>
          <MedicationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Registro de Medicamentos y Recetas
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Complete la información del medicamento y la receta médica
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
          border: '1px solid',
          borderColor: 'primary.200'
        }}
      >
        <form onSubmit={handleFormSubmit}>
          <Grid container spacing={3}>
            {/* Información del Medicamento */}
            <Grid item xs={12}>
              <Card sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <PharmacyIcon sx={{ mr: 1 }} />
                    Información del Medicamento
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nombre del Medicamento"
                        name="nombre_medicamento"
                        value={formData.nombre_medicamento}
                        onChange={handleChange}
                        required
                        placeholder="Ej: Paracetamol 500mg"
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
                        <InputLabel>Tipo de Medicamento</InputLabel>
                        <Select
                          name="tipo_medicamento"
                          value={formData.tipo_medicamento}
                          onChange={handleChange}
                          label="Tipo de Medicamento"
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
                          {tiposMedicamento.map((tipo) => (
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
                        placeholder="Detalles del medicamento, composición, efectos secundarios..."
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

            {/* Información de la Receta */}
            <Grid item xs={12}>
              <Card sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <DescriptionIcon sx={{ mr: 1 }} />
                    Información de la Receta
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Dosis"
                        name="dosis"
                        value={formData.dosis}
                        onChange={handleChange}
                        required
                        placeholder="Ej: 1 tableta"
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
                        label="Duración del Tratamiento"
                        name="duracion"
                        value={formData.duracion}
                        onChange={handleChange}
                        required
                        placeholder="Ej: 7 días"
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
                        label="Fecha de Receta"
                        name="fecha_receta"
                        type="date"
                        value={formData.fecha_receta}
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
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Instrucciones Médicas"
                        name="receta"
                        value={formData.receta}
                        onChange={handleChange}
                        required
                        multiline
                        rows={4}
                        placeholder="Instrucciones detalladas, precauciones, contraindicaciones..."
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

            {/* Información del Paciente y Médico */}
            <Grid item xs={12}>
              <Card sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, display: 'flex', alignItems: 'center' }}>
                    <CheckIcon sx={{ mr: 1 }} />
                    Información del Paciente y Médico
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
                            label="Médico"
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
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              endIcon={<SaveIcon />}
              sx={{
                background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  transform: 'translateY(-1px)',
                },
                boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
                px: 4,
                py: 1.5,
              }}
            >
              Guardar Receta
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setFormData({
                nombre_medicamento: '',
                descripcion: '',
                receta: '',
                fecha_receta: '',
                tipo_medicamento: '',
                dosis: '',
                frecuencia: '',
                duracion: '',
                paciente: '',
                medico: ''
              })}
              sx={{
                borderColor: 'primary.300',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50',
                },
                px: 4,
                py: 1.5,
              }}
            >
              Limpiar Formulario
            </Button>
          </Box>
        </form>
      </Paper>

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
    </Container>
  );
};

export default FormularioMedicamentos;