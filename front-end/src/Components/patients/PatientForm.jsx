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
    tipoPaciente: '',
    telefonos: [],
    correos: [],
    direcciones: [],
    numeroExpediente: '',
  });

  // Mapear initialData (forma del backend) a los campos del formulario
  useEffect(() => {
    if (!initialData || Object.keys(initialData).length === 0) return;

    setFormData(prev => ({
      nombre: initialData.atr_nombre || initialData.nombre || prev.nombre,
      apellido: initialData.atr_apellido || initialData.apellido || prev.apellido,
      identidad: initialData.atr_identidad || initialData.identidad || prev.identidad,
      fechaNacimiento: initialData.atr_fecha_nacimiento || initialData.fechaNacimiento || prev.fechaNacimiento,
      // El backend usa `atr_id_genero` (número). Guardamos el id directamente.
      genero: initialData.atr_id_genero ?? initialData.genero ?? prev.genero,
      // Tipo de paciente viene como `atr_id_tipo_paciente` desde el backend
      tipoPaciente: initialData.atr_id_tipo_paciente ?? initialData.tipoPaciente ?? prev.tipoPaciente,
      telefonos: (initialData.telefonos && initialData.telefonos.length) ? initialData.telefonos.map(p => ({ atr_telefono: p.atr_telefono || p.telefono || '' })) : prev.telefonos,
      correos: (initialData.correos && initialData.correos.length) ? initialData.correos.map(e => ({ atr_correo: e.atr_correo || e.correo || '' })) : prev.correos,
      direcciones: (initialData.direcciones && initialData.direcciones.length) ? initialData.direcciones.map(d => ({ atr_direccion_completa: d.atr_direccion_completa || d.direccion || '' })) : prev.direcciones,
      alergias: (initialData.alergias && initialData.alergias.length) ? initialData.alergias.map(a => ({ atr_alergia: a.atr_alergia || a })) : (initialData.alergias || []),
      vacunas: (initialData.vacunas && initialData.vacunas.length) ? initialData.vacunas.map(v => ({ atr_vacuna: v.atr_vacuna || v.atr_vacuna || '', atr_fecha_vacunacion: v.atr_fecha_vacunacion || v.atr_fecha || v.fecha_vacunacion || '' })) : (initialData.vacunas || []),
      numeroExpediente: initialData.atr_numero_expediente || initialData.numeroExpediente || prev.numeroExpediente
    }));
  }, [initialData]);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientTypes, setPatientTypes] = useState([]);

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
    if (!formData.tipoPaciente) {
      newErrors.tipoPaciente = 'El tipo de paciente es requerido';
    }
    
    if (!formData.telefonos || formData.telefonos.length === 0 || !formData.telefonos[0].atr_telefono?.trim()) {
      newErrors.telefonos = 'Al menos un teléfono es requerido';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.correos = 'El email no es válido';
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
        await dispatch(updatePatient({ id: initialData.atr_id_paciente, patientData: formData })).unwrap();
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
          tipoPaciente: '',
          telefonos: [],
          correos: [],
          direcciones: [],
          alergias: [],
          vacunas: [],
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
      tipoPaciente: '',
      telefonos: [],
      correos: [],
      direcciones: [],
      alergias: [],
      vacunas: [],
      numeroExpediente: ''
    });
    setErrors({});
  };

  // Handlers for dynamic arrays
  const handleAddPhone = () => setFormData(prev => ({ ...prev, telefonos: [...(prev.telefonos||[]), { atr_telefono: '' }] }));
  const handleRemovePhone = (idx) => setFormData(prev => ({ ...prev, telefonos: prev.telefonos.filter((_,i) => i !== idx) }));
  const handlePhoneChange = (idx) => (e) => {
    const val = e.target.value;
    setFormData(prev => {
      const arr = [...(prev.telefonos||[])]; arr[idx] = { ...arr[idx], atr_telefono: val }; return { ...prev, telefonos: arr };
    });
    if (errors.telefonos) setErrors(prev => ({ ...prev, telefonos: '' }));
  };

  const handleAddCorreo = () => setFormData(prev => ({ ...prev, correos: [...(prev.correos||[]), { atr_correo: '' }] }));
  const handleRemoveCorreo = (idx) => setFormData(prev => ({ ...prev, correos: prev.correos.filter((_,i) => i !== idx) }));
  const handleCorreoChange = (idx) => (e) => {
    const val = e.target.value;
    setFormData(prev => { const arr = [...(prev.correos||[])]; arr[idx] = { ...arr[idx], atr_correo: val }; return { ...prev, correos: arr }; });
  };

  const handleAddDireccion = () => setFormData(prev => ({ ...prev, direcciones: [...(prev.direcciones||[]), { atr_direccion_completa: '' }] }));
  const handleRemoveDireccion = (idx) => setFormData(prev => ({ ...prev, direcciones: prev.direcciones.filter((_,i) => i !== idx) }));
  const handleDireccionChange = (idx) => (e) => {
    const val = e.target.value;
    setFormData(prev => { const arr = [...(prev.direcciones||[])]; arr[idx] = { ...arr[idx], atr_direccion_completa: val }; return { ...prev, direcciones: arr }; });
  };

  const handleAddAlergia = () => setFormData(prev => ({ ...prev, alergias: [...(prev.alergias||[]), { atr_alergia: '' }] }));
  const handleRemoveAlergia = (idx) => setFormData(prev => ({ ...prev, alergias: prev.alergias.filter((_,i) => i !== idx) }));
  const handleAlergiaChange = (idx) => (e) => { const val = e.target.value; setFormData(prev => { const arr = [...(prev.alergias||[])]; arr[idx] = { ...arr[idx], atr_alergia: val }; return { ...prev, alergias: arr }; }); };

  const handleAddVacuna = () => setFormData(prev => ({ ...prev, vacunas: [...(prev.vacunas||[]), { atr_vacuna: '', atr_fecha_vacunacion: '' }] }));
  const handleRemoveVacuna = (idx) => setFormData(prev => ({ ...prev, vacunas: prev.vacunas.filter((_,i) => i !== idx) }));
  const handleVacunaChange = (idx, field) => (e) => { const val = e.target.value; setFormData(prev => { const arr = [...(prev.vacunas||[])]; arr[idx] = { ...arr[idx], [field]: val }; return { ...prev, vacunas: arr }; }); };

  // Cargar tipos de paciente desde backend si existe endpoint; si falla, usar fallback
  useEffect(() => {
    let mounted = true;
    const loadTypes = async () => {
      try {
        // Intentar endpoint específico bajo patients service
        const patientService = require('../../services/patientService');
        const res = await patientService.getPatientTypes();
        if (mounted && res && res.data) {
          setPatientTypes(Array.isArray(res.data) ? res.data : res.data.data || []);
          return;
        }
      } catch (e) {
        // ignore
      }

      // Fallback estático si no hay endpoint
      if (mounted) {
        setPatientTypes([
          { value: 1, label: 'General' },
          { value: 2, label: 'VIP' },
          { value: 3, label: 'Otro' }
        ]);
      }
    };
    loadTypes();
    return () => { mounted = false; };
  }, []);

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
              {/* Usar IDs numéricos que corresponden a tbl_genero seed: 1=Masculino, 2=Femenino, 3=No Binario */}
              <MenuItem value={1}>Masculino</MenuItem>
              <MenuItem value={2}>Femenino</MenuItem>
              <MenuItem value={3}>No binario</MenuItem>
            </Select>
            {errors.genero && <FormHelperText>{errors.genero}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.tipoPaciente} disabled={isSubmitting}>
            <InputLabel>Tipo de paciente</InputLabel>
            <Select
              value={formData.tipoPaciente}
              onChange={handleChange('tipoPaciente')}
              label="Tipo de paciente"
            >
              {patientTypes.map((t) => (
                <MenuItem key={t.value ?? t.atr_id_tipo_paciente ?? t.id} value={t.value ?? t.atr_id_tipo_paciente ?? t.id}>
                  {(t.label ?? t.atr_nombre_tipo_paciente ?? t.nombre) || 'Tipo'}
                </MenuItem>
              ))}
            </Select>
            {errors.tipoPaciente && <FormHelperText>{errors.tipoPaciente}</FormHelperText>}
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
          {errors.telefonos && (
            <Typography color="error" variant="caption">{errors.telefonos}</Typography>
          )}
          {(formData.telefonos || []).map((p, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                label={idx === 0 ? 'Teléfono' : `Teléfono ${idx + 1}`}
                value={p.atr_telefono}
                onChange={handlePhoneChange(idx)}
                disabled={isSubmitting}
              />
              <Button size="small" color="error" onClick={() => handleRemovePhone(idx)} disabled={isSubmitting}>Eliminar</Button>
            </Box>
          ))}
          <Button onClick={handleAddPhone} disabled={isSubmitting} sx={{ mt: 1 }}>Agregar teléfono</Button>
        </Grid>

        <Grid item xs={12} sm={6}>
          {(formData.correos || []).map((e, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                label={idx === 0 ? 'Email' : `Email ${idx + 1}`}
                type="email"
                value={e.atr_correo}
                onChange={handleCorreoChange(idx)}
                disabled={isSubmitting}
              />
              <Button size="small" color="error" onClick={() => handleRemoveCorreo(idx)} disabled={isSubmitting}>Eliminar</Button>
            </Box>
          ))}
          <Button onClick={handleAddCorreo} disabled={isSubmitting} sx={{ mt: 1 }}>Agregar correo</Button>
        </Grid>

        <Grid item xs={12}>
          {(formData.direcciones || []).map((d, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                label={idx === 0 ? 'Dirección' : `Dirección ${idx + 1}`}
                value={d.atr_direccion_completa}
                onChange={handleDireccionChange(idx)}
                disabled={isSubmitting}
                multiline
                rows={2}
              />
              <Button size="small" color="error" onClick={() => handleRemoveDireccion(idx)} disabled={isSubmitting}>Eliminar</Button>
            </Box>
          ))}
          <Button onClick={handleAddDireccion} disabled={isSubmitting} sx={{ mt: 1 }}>Agregar dirección</Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Alergias</Typography>
          {(formData.alergias || []).map((a, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField fullWidth label={`Alergia ${idx + 1}`} value={a.atr_alergia} onChange={handleAlergiaChange(idx)} disabled={isSubmitting} />
              <Button size="small" color="error" onClick={() => handleRemoveAlergia(idx)} disabled={isSubmitting}>Eliminar</Button>
            </Box>
          ))}
          <Button onClick={handleAddAlergia} disabled={isSubmitting} sx={{ mt: 1 }}>Agregar alergia</Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Vacunas</Typography>
          {(formData.vacunas || []).map((v, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <TextField fullWidth label={`Vacuna ${idx + 1}`} value={v.atr_vacuna} onChange={handleVacunaChange(idx, 'atr_vacuna')} disabled={isSubmitting} />
              <TextField type="date" value={v.atr_fecha_vacunacion} onChange={handleVacunaChange(idx, 'atr_fecha_vacunacion')} disabled={isSubmitting} sx={{ width: 200 }} InputLabelProps={{ shrink: true }} />
              <Button size="small" color="error" onClick={() => handleRemoveVacuna(idx)} disabled={isSubmitting}>Eliminar</Button>
            </Box>
          ))}
          <Button onClick={handleAddVacuna} disabled={isSubmitting} sx={{ mt: 1 }}>Agregar vacuna</Button>
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


