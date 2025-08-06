import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { createPatient, updatePatient, clearError } from '../../redux/patients/patientsSlice';

const PatientForm = ({ initialData = {}, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { error } = useSelector(state => state.patients);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    identidad: '',
    fechaNacimiento: '',
    genero: '',
    telefono: '',
    email: '',
    direccion: '',
    numeroExpediente: '',
    ...initialData
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpiar error cuando cambia
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Manejar cambios en el formulario
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.apellido?.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }
    
    if (!formData.identidad?.trim()) {
      newErrors.identidad = 'La identidad es requerida';
    } else if (formData.identidad.length < 13) {
      newErrors.identidad = 'La identidad debe tener 13 dígitos';
    }
    
    if (!formData.fechaNacimiento) {
      newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
    }
    
    if (!formData.genero) {
      newErrors.genero = 'El género es requerido';
    }
    
    if (!formData.telefono?.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (initialData.atr_id_paciente) {
        // Actualizar paciente existente
        await dispatch(updatePatient({ id: initialData.atr_id_paciente, data: formData })).unwrap();
      } else {
        // Crear nuevo paciente
        await dispatch(createPatient(formData)).unwrap();
      }
      
      // Limpiar formulario si es nuevo paciente
      if (!initialData.atr_id_paciente) {
        setFormData({
          nombre: '',
          apellido: '',
          identidad: '',
          fechaNacimiento: '',
          genero: '',
          telefono: '',
          email: '',
          direccion: '',
          numeroExpediente: ''
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al guardar paciente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar limpieza del formulario
  const handleClear = () => {
    setFormData({
      nombre: '',
      apellido: '',
      identidad: '',
      fechaNacimiento: '',
      genero: '',
      telefono: '',
      email: '',
      direccion: '',
      numeroExpediente: ''
    });
    setErrors({});
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{ 
        p: 2,
        maxHeight: '70vh',
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
      <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
        {initialData.atr_id_paciente ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Información Personal */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2, color: 'primary.main', fontWeight: 500 }}>
            <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Información Personal
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nombre"
            value={formData.nombre}
            onChange={handleChange('nombre')}
            error={!!errors.nombre}
            helperText={errors.nombre}
            disabled={isSubmitting}
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
            label="Apellido"
            value={formData.apellido}
            onChange={handleChange('apellido')}
            error={!!errors.apellido}
            helperText={errors.apellido}
            disabled={isSubmitting}
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
            label="Identidad"
            value={formData.identidad}
            onChange={handleChange('identidad')}
            error={!!errors.identidad}
            helperText={errors.identidad}
            disabled={isSubmitting}
            inputProps={{ maxLength: 13 }}
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
            label="Número de Expediente"
            value={formData.numeroExpediente}
            onChange={handleChange('numeroExpediente')}
            disabled={isSubmitting}
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
            type="date"
            value={formData.fechaNacimiento}
            onChange={handleChange('fechaNacimiento')}
            error={!!errors.fechaNacimiento}
            helperText={errors.fechaNacimiento}
            disabled={isSubmitting}
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
          <FormControl fullWidth error={!!errors.genero} disabled={isSubmitting}>
            <InputLabel>Género</InputLabel>
            <Select
              value={formData.genero}
              onChange={handleChange('genero')}
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
              <MenuItem value="M">Masculino</MenuItem>
              <MenuItem value="F">Femenino</MenuItem>
              <MenuItem value="O">Otro</MenuItem>
            </Select>
            {errors.genero && <FormHelperText>{errors.genero}</FormHelperText>}
          </FormControl>
        </Grid>

        {/* Información de Contacto */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" sx={{ mb: 2, mt: 2, color: 'primary.main', fontWeight: 500 }}>
            <PhoneIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Información de Contacto
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Teléfono"
            value={formData.telefono}
            onChange={handleChange('telefono')}
            error={!!errors.telefono}
            helperText={errors.telefono}
            disabled={isSubmitting}
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
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            disabled={isSubmitting}
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
            value={formData.direccion}
            onChange={handleChange('direccion')}
            disabled={isSubmitting}
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

      {/* Botones de Acción */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={handleClear}
          disabled={isSubmitting}
          startIcon={<ClearIcon />}
          sx={{
            borderColor: 'primary.300',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'primary.50',
            },
          }}
        >
          Limpiar
        </Button>
        
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{
            background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              transform: 'translateY(-1px)',
            },
            boxShadow: '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
            '&:disabled': {
              opacity: 0.5,
              transform: 'none'
            }
          }}
        >
          {isSubmitting ? 'Guardando...' : (initialData.atr_id_paciente ? 'Actualizar' : 'Guardar')}
        </Button>
      </Box>
    </Box>
  );
};

export default PatientForm;


