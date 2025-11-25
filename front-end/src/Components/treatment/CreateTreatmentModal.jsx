import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { getActivePatients, fetchPatients, formatPatientForForm } from '../../services/patientService';
import { getActiveDoctors, fetchDoctors, formatDoctorForForm } from '../../services/doctorService';

const CreateTreatmentModal = ({ open = false, onClose = () => {}, onSave = null }) => {
  const theme = useTheme();

  const navigate = useNavigate();

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
  // Estados y listas necesarias
  const [pacientes, setPacientesList] = useState([]);
  const [medicos, setMedicosList] = useState([]);

  // Datos simulados / opciones por defecto
  const tiposTratamiento = [
    'Fisioterapia',
    'Farmacológico',
    'Terapia Ocupacional',
    'Rehabilitación'
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

  const estados = [
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'INACTIVO', label: 'Inactivo' },
    { value: 'COMPLETADO', label: 'Completado' }
  ];
  // Load patients and doctors for the selects
  React.useEffect(() => {
    let mounted = true;
    const loadLists = async () => {
      try {
        const pRes = await getActivePatients().catch(() => fetchPatients());
        const patientsData = (pRes && pRes.data) ? (pRes.data.data || pRes.data) : (pRes || []);
        if (mounted) {
          const list = Array.isArray(patientsData) ? patientsData : [];
          const normalizedPatients = list.map(p => formatPatientForForm(p));
          setPacientesList(normalizedPatients);
        }

        const dRes = await getActiveDoctors().catch(() => fetchDoctors());
        const doctorsData = (dRes && dRes.data) ? (dRes.data.data || dRes.data) : (dRes || []);
        if (mounted) {
          const list = Array.isArray(doctorsData) ? doctorsData : [];
          const normalizedDoctors = list.map(d => formatDoctorForForm(d));
          setMedicosList(normalizedDoctors);
        }
      } catch (err) {
        console.error('Error cargando pacientes/medicos', err);
      }
    };
    loadLists();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setNotification({
        message: 'Por favor, complete todos los campos requeridos',
        type: 'error',
        open: true
      });
      return;
    }

    try {
      setNotification({ message: 'Creando tratamiento...', type: 'info', open: true });
      // Construir payload con los atributos que espera el backend
      const payload = {
        patientId: parseInt(formData.paciente, 10),
        doctorId: parseInt(formData.medico, 10),
        treatmentType: formData.tipo_tratamiento || formData.nombre_tratamiento,
        description: formData.descripcion,
        startDate: formData.fecha_inicio,
        endDate: formData.fecha_fin || null,
        frequency: formData.frecuencia,
        duration: formData.duracion,
        medications: [],
        observations: formData.observaciones,
        status: (formData.estado || 'ACTIVO').toString().toUpperCase()
      };

      // onSave debe devolver el tratamiento creado
      let created = null;
      if (onSave) {
        created = await onSave(payload);
      }

      setNotification({
        message: 'Tratamiento creado exitosamente!',
        type: 'success',
        open: true
      });

      // Limpiar formulario
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

      // Si se devolvió el tratamiento creado, navegar a su vista
      const id = created?.id || created?.atr_id_tratamiento || created?._id;
      if (id) {
        // Navegar a la lista y abrir el detalle mediante query param
        navigate(`/tratamientos/lista?treatmentId=${id}`);
      }

      // Cerrar modal
      if (onClose) onClose();
    } catch (err) {
      console.error('Error creating treatment', err);
      const message = err?.response?.data?.message || err?.message || 'Error al crear tratamiento';
      setNotification({ message, type: 'error', open: true });
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
            backgroundColor: 'background.paper',
            color: 'accent.main',
            border: '1px solid',
            borderColor: 'brand.paleL2'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'accent.main', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 1,
          backgroundColor: 'background.paper'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MedicalIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Crear Nuevo Tratamiento</Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'primary.main' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

  <DialogContent dividers sx={{ backgroundColor: 'background.paper', color: 'accent.main' }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Información Básica del Tratamiento */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2, backgroundColor: 'background.paper', border: '1px solid', borderColor: 'brand.paleL2' }}>
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
                          getOptionLabel={(option) => {
                            const nombre = option.atr_nombre || option.nombre || '';
                            const apellido = option.atr_apellido || option.apellido || '';
                            const identidad = option.atr_identidad || option.identidad || option.atr_numero_expediente || '';
                            return `${nombre} ${apellido}${identidad ? ` - ${identidad}` : ''}`;
                          }}
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
                              paciente: newValue ? (newValue.atr_id_paciente ?? newValue.id) : ''
                            }));
                          }}
                          value={pacientes.find(p => (p.atr_id_paciente ?? p.id) === formData.paciente) || null}
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
                          getOptionLabel={(option) => {
                            const nombre = option.atr_nombre || option.nombre || '';
                            const apellido = option.atr_apellido || option.apellido || '';
                            const especial = (option.Especialidades && option.Especialidades[0] && option.Especialidades[0].atr_especialidad) || option.especialidad || '';
                            return `${nombre} ${apellido}${especial ? ` - ${especial}` : ''}`;
                          }}
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
                              medico: newValue ? (newValue.atr_id_medico ?? newValue.id) : ''
                            }));
                          }}
                          value={medicos.find(m => (m.atr_id_medico ?? m.id) === formData.medico) || null}
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

        <DialogActions sx={{ p: 3, pt: 1, backgroundColor: 'background.paper', color: 'accent.main' }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              borderColor: 'primary.300',
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