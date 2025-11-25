import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  TextField,
  Button,
  Grid,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  MedicalServices as MedicalIcon,
  CheckCircle as CheckIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import useEspecialidades from '../../hooks/useEspecialidades';
import useGeneros from '../../hooks/useGeneros';
import useTiposMedico from '../../hooks/useTiposMedico';
import './DoctorRegistrationForm.css';
import DoctorSchedule from './DoctorSchedule';

function DoctorRegistrationForm({ open = false, onClose, initialData = {}, onSave, onCancel, autoCloseOnSave = true, readOnly = false }) {
  // Guardar una referencia segura: si el caller pasa `null`, el parámetro default (= {}) no aplica,
  // por eso normalizamos aquí a un objeto vacío para evitar errores al leer propiedades.
  const init = initialData || {};
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Función para convertir formato de fecha
  const convertDateFormat = (dateString) => {
    if (!dateString) return '';
    
    // Si ya está en formato YYYY-MM-DD, devolverlo tal como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Si está en formato DD/MM/YYYY, convertirlo
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Si es una fecha válida, intentar convertirla
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return '';
  };

  // Estado para los datos del médico
  // Normalizar listas de contacto para que siempre tengan la forma esperada por la UI/backend
  const normalizeContactList = (list, type) => {
    if (!list || !Array.isArray(list) || list.length === 0) return [];
    return list.map((item, idx) => {
      const id = item.id || item.atr_id_telefono || item.atr_id_correo_m || item.atr_id_direccion_m || idx + 1;
      if (type === 'telefonos') return { id, atr_telefono: item.atr_telefono || item.atr_telefono || item.value || '' };
      if (type === 'correos') return { id, atr_correo: item.atr_correo || item.atr_correo || item.value || item.email || '' };
      if (type === 'direcciones') return { id, atr_direccion_completa: item.atr_direccion_completa || item.address || '' };
      return { id, ...item };
    });
  };

  const buildInitialDoctor = (init) => {
    const normalized = init || {};
    return {
      atr_nombre: normalized.atr_nombre || '',
      atr_apellido: normalized.atr_apellido || '',
      atr_fecha_nacimiento: convertDateFormat(normalized.atr_fecha_nacimiento) || '',
      atr_identidad: normalized.atr_identidad || '',
      atr_id_genero: normalized.atr_id_genero || '',
      atr_numero_colegiado: normalized.atr_numero_colegiado || '',
      atr_id_tipo_medico: normalized.atr_id_tipo_medico || '',
      telefonos: normalizeContactList(normalized.telefonos, 'telefonos'),
      direcciones: normalizeContactList(normalized.direcciones, 'direcciones'),
      correos: normalizeContactList(normalized.correos, 'correos'),
      especialidades: (() => {
        const raw = normalized.Especialidades || normalized.especialidades || [];
        if (!raw || !Array.isArray(raw) || raw.length === 0) return [{ id: 1, atr_id_especialidad: null, atr_especialidad: '' }];

        return raw.map((e, idx) => {
          if (typeof e === 'number') {
            return { id: idx + 1, atr_id_especialidad: e, atr_especialidad: '' };
          }
          if (typeof e === 'string') {
            return { id: idx + 1, atr_id_especialidad: null, atr_especialidad: e };
          }
          const idVal = e.atr_id_especialidad || e.id || e.atr_id || e.value || null;
          const nameVal = e.atr_especialidad || e.atr_nombre || e.name || e.label || '';
          return { id: idx + 1, atr_id_especialidad: idVal, atr_especialidad: nameVal };
        });
      })(),
      horarios: (normalized.horarios && typeof normalized.horarios === 'object') ? normalized.horarios : {},
    };
  };

  const [doctor, setDoctor] = useState(() => buildInitialDoctor(init));
  const [saving, setSaving] = useState(false);

  // Si cambia `initialData` (abrir modal para editar), resetear el estado del formulario
  useEffect(() => {
    setDoctor(buildInitialDoctor(initialData || {}));
  }, [initialData]);

  // Estado para el paso actual del formulario
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Estado para notificaciones
  const [notification, setNotification] = useState(null);

  // Géneros cargados desde API
  const { options: mockGeneros, loading: loadingGeneros } = useGeneros();

  const { options: tiposOptions, loading: loadingTipos, error: tiposError } = useTiposMedico();

  const { options: especialidadesOptions, loading: loadingEspecialidades, error: especialidadesError } = useEspecialidades();

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, open: true });
  };

  // Función para cerrar notificaciones
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  

  // Función para limpiar campos vacíos
  const cleanEmptyFields = () => {
    setDoctor(prevDoctor => ({
      ...prevDoctor,
      telefonos: prevDoctor.telefonos.filter(t => String(t.atr_telefono || '').trim() !== ''),
      direcciones: prevDoctor.direcciones.filter(d => String(d.atr_direccion_completa || '').trim() !== ''),
      correos: prevDoctor.correos.filter(c => String(c.atr_correo || '').trim() !== '')
    }));
  };

  // Función para validar el paso actual
  const validateCurrentStep = () => {
    console.log('🔍 Validando paso:', currentStep);
    console.log('📋 Datos del médico:', doctor);
    
    switch (currentStep) {
      case 1: // Información Personal
        console.log('✅ Validando Información Personal...');
        console.log('📝 Nombre:', doctor.atr_nombre);
        console.log('📝 Apellido:', doctor.atr_apellido);
        console.log('📅 Fecha de nacimiento:', doctor.atr_fecha_nacimiento);
        console.log('🆔 Identidad:', doctor.atr_identidad);
        console.log('👤 Género:', doctor.atr_id_genero);
        
        if (!String(doctor.atr_nombre || '').trim()) {
          console.log('❌ Error: Nombre vacío');
          showNotification('Por favor, ingrese el nombre del médico.', 'error');
          return false;
        }
        
        if (!String(doctor.atr_apellido || '').trim()) {
          console.log('❌ Error: Apellido vacío');
          showNotification('Por favor, ingrese el apellido del médico.', 'error');
          return false;
        }
        
        // Validación de fecha de nacimiento
        if (!doctor.atr_fecha_nacimiento) {
          console.log('❌ Error: Fecha de nacimiento vacía');
          showNotification('Por favor, seleccione la fecha de nacimiento.', 'error');
          return false;
        }
        
        // Verificar que la fecha sea válida
        const fechaNacimiento = new Date(doctor.atr_fecha_nacimiento);
        if (isNaN(fechaNacimiento.getTime())) {
          console.log('❌ Error: Fecha de nacimiento inválida');
          showNotification('Por favor, ingrese una fecha de nacimiento válida.', 'error');
          return false;
        }
        
        // Verificar que la fecha no sea futura
        if (fechaNacimiento > new Date()) {
          console.log('❌ Error: Fecha de nacimiento futura');
          showNotification('La fecha de nacimiento no puede ser futura.', 'error');
          return false;
        }
        
        if (!String(doctor.atr_identidad || '').trim()) {
          console.log('❌ Error: Identidad vacía');
          showNotification('Por favor, ingrese el número de identidad.', 'error');
          return false;
        }
        
        if (!/^\d{13}$/.test(String(doctor.atr_identidad || ''))) {
          console.log('❌ Error: Identidad inválida');
          showNotification('El número de identidad debe contener exactamente 13 dígitos numéricos.', 'error');
          return false;
        }

        // Max length según modelo: varchar(20)
        if (doctor.atr_identidad && String(doctor.atr_identidad).length > 20) {
          showNotification('El número de identidad no puede exceder 20 caracteres.', 'error');
          return false;
        }
        
        // Validar que se haya seleccionado un género
        if (!doctor.atr_id_genero) {
          console.log('❌ Error: Género no seleccionado');
          showNotification('Por favor, seleccione el género del médico.', 'error');
          return false;
        }
        
        console.log('✅ Información Personal válida');
        break;
      case 2: // Información Profesional
        console.log('✅ Validando Información Profesional...');
        console.log('📋 Número de colegiado:', doctor.atr_numero_colegiado);
        console.log('📋 Tipo de médico:', doctor.atr_id_tipo_medico);
        
        if (!String(doctor.atr_numero_colegiado || '').trim()) {
          console.log('❌ Error: Número de colegiado vacío');
          showNotification('Por favor, ingrese el número de colegiado del médico.', 'error');
          return false;
        }
        
        if (!doctor.atr_id_tipo_medico) {
          console.log('❌ Error: Tipo de médico no seleccionado');
          showNotification('Por favor, seleccione el tipo de médico.', 'error');
          return false;
        }

        // Validar longitud del número de colegiado según modelo varchar(15)
        if (doctor.atr_numero_colegiado && String(doctor.atr_numero_colegiado).length > 15) {
          showNotification('El número de colegiado no puede exceder 15 caracteres.', 'error');
          return false;
        }

        // Validar que las especialidades seleccionadas sean válidas (deben tener id)
        const hasInvalidEspecialidad = Array.isArray(doctor.especialidades) ? doctor.especialidades.some(e => !e.atr_id_especialidad) : true;
        if (hasInvalidEspecialidad) {
          console.log('❌ Error: Hay especialidades sin id seleccionadas');
          showNotification('Por favor seleccione especialidades válidas desde la lista (no cree nuevas).', 'error');
          return false;
        }

        // Validar horarios (formato HH:MM y hora inicio < hora fin)
        const validateHorarios = () => {
          if (!doctor.horarios || Object.keys(doctor.horarios).length === 0) return true;
          const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
          const errors = [];
          Object.entries(doctor.horarios).forEach(([day, intervals]) => {
            if (!Array.isArray(intervals)) return;
            intervals.forEach((iv, idx) => {
              const start = iv.start;
              const end = iv.end;
              if (!start || !end) {
                errors.push(`${day} intervalo ${idx + 1}: faltan horas`);
                return;
              }
              if (!timeRegex.test(start) || !timeRegex.test(end)) {
                errors.push(`${day} intervalo ${idx + 1}: formato de hora inválido`);
                return;
              }
              if (start >= end) {
                errors.push(`${day} intervalo ${idx + 1}: la hora de inicio debe ser menor que la hora de fin`);
              }
            });
          });
          if (errors.length > 0) {
            showNotification('Horarios inválidos: ' + errors.join('; '), 'error');
            return false;
          }
          return true;
        };

        if (!validateHorarios()) {
          console.log('❌ Error: Horarios inválidos');
          return false;
        }
        
        console.log('✅ Información Profesional válida');
        break;
      case 3: // Información de Contacto
        console.log('✅ Validando Información de Contacto...');
        console.log('📞 Teléfonos:', doctor.telefonos);
        console.log('📍 Direcciones:', doctor.direcciones);
        console.log('📧 Correos:', doctor.correos);
        
        // Si no hay información de contacto, permitir continuar
        if (doctor.telefonos.length === 0 && doctor.direcciones.length === 0 && doctor.correos.length === 0) {
          console.log('✅ No hay información de contacto - permitiendo continuar');
          return true;
        }
        
        // Verificar teléfonos si existen
        if (doctor.telefonos.length > 0) {
          const hasValidTelefono = Array.isArray(doctor.telefonos) && doctor.telefonos.some(t => String(t.atr_telefono || '').trim() !== '');
          if (!hasValidTelefono) {
            console.log('❌ Error: No hay teléfonos válidos');
            showNotification('Por favor, ingrese al menos un número de teléfono válido o elimine los campos vacíos.', 'error');
            return false;
          }
        }
        
        // Verificar direcciones si existen
        if (doctor.direcciones.length > 0) {
          const hasValidDireccion = Array.isArray(doctor.direcciones) && doctor.direcciones.some(d => String(d.atr_direccion_completa || '').trim() !== '');
          if (!hasValidDireccion) {
            console.log('❌ Error: No hay direcciones válidas');
            showNotification('Por favor, ingrese al menos una dirección o elimine los campos vacíos.', 'error');
            return false;
          }
        }
        
        // Verificar correos si existen
        if (doctor.correos.length > 0) {
          const hasValidCorreo = Array.isArray(doctor.correos) && doctor.correos.some(c => String(c.atr_correo || '').trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(c.atr_correo || '')));
          if (!hasValidCorreo) {
            console.log('❌ Error: No hay correos válidos');
            showNotification('Por favor, ingrese al menos un correo electrónico válido o elimine los campos vacíos.', 'error');
            return false;
          }
        }
        
        console.log('✅ Información de Contacto válida');
        break;
        case 4: // Confirmación
            // Antes de guardar, validar horarios también por seguridad
            if (doctor.horarios && Object.keys(doctor.horarios).length > 0) {
              const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
              for (const [day, intervals] of Object.entries(doctor.horarios)) {
                if (!Array.isArray(intervals)) continue;
                for (let i = 0; i < intervals.length; i++) {
                  const iv = intervals[i];
                  const start = iv.start;
                  const end = iv.end;
                  if (!start || !end || !timeRegex.test(start) || !timeRegex.test(end) || start >= end) {
                    showNotification('Revise los horarios: hay intervalos inválidos antes de guardar.', 'error');
                    return false;
                  }
                }
              }
            }
            console.log('✅ Confirmación - sin validación adicional');
          break;
        default:
          break;
      }
    console.log('✅ Paso válido, continuando...');
    return true;
  };

  // Función para avanzar al siguiente paso
  const handleNext = () => {
    console.log('🔄 Intentando avanzar al siguiente paso...');
    console.log('📍 Paso actual:', currentStep);
    console.log('📋 Estado actual del doctor:', doctor);
    
    // Limpiar campos vacíos antes de validar (solo para paso 3)
    if (currentStep === 3) {
      cleanEmptyFields();
    }
    
    try {
      console.log('🔍 Iniciando validación...');
      const isValid = validateCurrentStep();
      console.log('✅ Resultado de validación:', isValid);
      
      if (isValid) {
        if (currentStep < totalSteps) {
          console.log('✅ Avanzando al paso:', currentStep + 1);
          setCurrentStep(currentStep + 1);
          console.log('✅ Paso actualizado a:', currentStep + 1);
        } else {
          console.log('✅ Llegando al final - ejecutando handleSubmit');
          handleSubmit();
        }
      } else {
        console.log('❌ Validación falló - no se puede avanzar');
        console.log('❌ Datos que causaron el fallo:', {
          nombre: doctor.atr_nombre,
          apellido: doctor.atr_apellido,
          fechaNacimiento: doctor.atr_fecha_nacimiento,
          identidad: doctor.atr_identidad,
          genero: doctor.atr_id_genero,
          numeroColegiado: doctor.atr_numero_colegiado,
          tipoMedico: doctor.atr_id_tipo_medico
        });
      }
    } catch (error) {
      console.error('❌ Error al avanzar:', error);
      console.error('❌ Stack trace:', error.stack);
      showNotification('Error al procesar el formulario. Por favor, intente nuevamente.', 'error');
    }
  };

  // Función para retroceder al paso anterior
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Manejador de cambios para campos simples
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Coerce numeric selects to numbers so Sequelize receives correct types
    const numericFields = ['atr_id_tipo_medico', 'atr_id_genero'];
    const newValue = numericFields.includes(name) ? (value === '' ? '' : Number(value)) : value;
    setDoctor(prevDoctor => ({
      ...prevDoctor,
      [name]: newValue
    }));
  };

  // Manejadores para campos dinámicos
  const handleDynamicChange = (type, id, field, value) => {
    setDoctor(prevDoctor => ({
      ...prevDoctor,
      [type]: prevDoctor[type].map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleAddDynamicField = (type) => {
    const newId = doctor[type].length > 0 ? Math.max(...doctor[type].map(item => item.id)) + 1 : 1;
    const defaultItem = (type === 'especialidades')
      ? { id: newId, atr_id_especialidad: null, atr_especialidad: '' }
      : (type === 'telefonos')
        ? { id: newId, atr_telefono: '' }
        : (type === 'direcciones')
          ? { id: newId, atr_direccion_completa: '' }
          : (type === 'correos')
            ? { id: newId, atr_correo: '' }
            : { id: newId };

    setDoctor(prevDoctor => ({
      ...prevDoctor,
      [type]: [...prevDoctor[type], defaultItem]
    }));
  };
  const handleRemoveDynamicField = (type, id) => {
    if (doctor[type].length > 1) {
      setDoctor(prevDoctor => ({
        ...prevDoctor,
        [type]: prevDoctor[type].filter(item => item.id !== id)
      }));
    }
  };

  // Horarios handler
  const handleHorariosChange = (nextHorarios) => {
    setDoctor(prev => ({ ...prev, horarios: nextHorarios }));
  };

  // Función para manejar el envío del formulario
  const handleSubmit = () => {
    if (validateCurrentStep()) {
      // Forzar parseo numérico de selects por seguridad
      const finalDoctor = {
        ...doctor,
        atr_id_tipo_medico: doctor.atr_id_tipo_medico === '' || doctor.atr_id_tipo_medico === null ? null : Number(doctor.atr_id_tipo_medico),
        atr_id_genero: doctor.atr_id_genero === '' || doctor.atr_id_genero === null ? null : Number(doctor.atr_id_genero)
      };

      // Filtrar campos vacíos
      const cleanDoctor = {
        ...finalDoctor,
        telefonos: finalDoctor.telefonos.filter(t => t.atr_telefono && t.atr_telefono.trim() !== ''),
        direcciones: finalDoctor.direcciones.filter(d => d.atr_direccion_completa && d.atr_direccion_completa.trim() !== ''),
        correos: finalDoctor.correos.filter(c => c.atr_correo && c.atr_correo.trim() !== ''),
        // Enviar 'especialidades' como array de ids tal y como espera el backend
        especialidades: finalDoctor.especialidades
          .map(e => (typeof e === 'number' ? e : e.atr_id_especialidad || null))
          .filter(id => !!id),
        // Incluir horarios en el payload (puede ser objeto con arrays por día)
        horarios: finalDoctor.horarios || {},
      };

      if (onSave) {
        const maybePromise = onSave(cleanDoctor);
        // soportar handler sincrono o async (promise)
        if (maybePromise && typeof maybePromise.then === 'function') {
          setSaving(true);
          maybePromise.then(() => {
            setSaving(false);
            if (autoCloseOnSave && onClose) onClose();
          }).catch(err => {
            setSaving(false);
            showNotification(err?.message || 'Error al guardar médico', 'error');
          });
        } else {
          if (autoCloseOnSave && onClose) onClose();
        }
      } else {
        console.log('Datos del médico a enviar:', cleanDoctor);
        showNotification('Médico registrado exitosamente!', 'success');
      }
    }
  };

  // Función para generar número de colegiado automáticamente
  const generateColegiado = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const colegiado = `COL${timestamp}${random}`;
    setDoctor(prev => ({ ...prev, atr_numero_colegiado: colegiado }));
  };

  // Función para renderizar el contenido del paso actual
  const getStepContent = (step) => {
    switch (step) {
      case 1:
        return (
          <Card className="form-card">
            <CardContent>
              <Typography variant="h6" className="step-title">
                <PersonIcon className="step-icon" />
                Información Personal
              </Typography>
              <Divider className="step-divider" />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre *"
                    name="atr_nombre"
                    value={doctor.atr_nombre}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="form-field"
                    required
                    error={!readOnly && !String(doctor.atr_nombre || '').trim()}
                    helperText={!readOnly && !String(doctor.atr_nombre || '').trim() ? "El nombre es obligatorio" : ""}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido *"
                    name="atr_apellido"
                    value={doctor.atr_apellido}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="form-field"
                    required
                    error={!readOnly && !String(doctor.atr_apellido || '').trim()}
                    helperText={!readOnly && !String(doctor.atr_apellido || '').trim() ? "El apellido es obligatorio" : ""}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fecha de Nacimiento *"
                    name="atr_fecha_nacimiento"
                    type="date"
                    value={doctor.atr_fecha_nacimiento}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="form-field"
                    required
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      max: new Date().toISOString().split('T')[0],
                      min: '1900-01-01'
                    }}
                    error={!doctor.atr_fecha_nacimiento}
                    helperText={!doctor.atr_fecha_nacimiento ? "La fecha de nacimiento es obligatoria" : "Seleccione su fecha de nacimiento"}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Número de Identidad *"
                    name="atr_identidad"
                    value={doctor.atr_identidad}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="form-field"
                    required
                    inputProps={{ maxLength: 13 }}
                    error={!readOnly && (!String(doctor.atr_identidad || '').trim() || (doctor.atr_identidad && !/^\d{13}$/.test(String(doctor.atr_identidad || ''))))}
                    helperText={
                      !readOnly && (!String(doctor.atr_identidad || '').trim() 
                        ? "La identidad es obligatoria" 
                        : (doctor.atr_identidad && !/^\d{13}$/.test(String(doctor.atr_identidad || '')))
                          ? "Debe contener exactamente 13 dígitos"
                          : "")
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth className="form-field" required error={!doctor.atr_id_genero}>
                    <InputLabel>Género *</InputLabel>
                    <Select
                      name="atr_id_genero"
                      value={doctor.atr_id_genero}
                      onChange={handleChange}
                      disabled={readOnly}
                      label="Género *"
                    >
                      {mockGeneros.map(g => (
                        <MenuItem key={g.value} value={g.value}>
                          {g.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {!doctor.atr_id_genero && (
                      <Typography variant="caption" color="error">
                        El género es obligatorio
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="form-card">
            <CardContent>
              <Typography variant="h6" className="step-title">
                <BadgeIcon className="step-icon" />
                Información Profesional
              </Typography>
              <Divider className="step-divider" />
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Número de Colegiado *"
                    name="atr_numero_colegiado"
                    value={doctor.atr_numero_colegiado}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="form-field"
                    required
                    error={!readOnly && !String(doctor.atr_numero_colegiado || '').trim()}
                    helperText={!readOnly && !String(doctor.atr_numero_colegiado || '').trim() ? "El número de colegiado es obligatorio" : ""}
                    InputProps={{
                      endAdornment: (
                        !readOnly ? (
                          <Button
                            size="small"
                            onClick={generateColegiado}
                            className="generate-btn"
                          >
                            Generar
                          </Button>
                        ) : null
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth className="form-field" required error={!doctor.atr_id_tipo_medico}>
                    <InputLabel>Tipo de Médico *</InputLabel>
                    <Select
                      name="atr_id_tipo_medico"
                      value={doctor.atr_id_tipo_medico}
                      onChange={handleChange}
                      disabled={readOnly}
                      label="Tipo de Médico *"
                      required
                    >
                        {loadingTipos ? (
                          <MenuItem value="">Cargando...</MenuItem>
                        ) : tiposOptions.length > 0 ? (
                          tiposOptions.map(tipo => (
                            <MenuItem key={tipo.id ?? tipo.value} value={tipo.id ?? tipo.value}>
                              {tipo.name ?? tipo.label}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="">No hay tipos disponibles</MenuItem>
                        )}
                    </Select>
                      {!doctor.atr_id_tipo_medico && (
                        <Typography variant="caption" color="error">
                          El tipo de médico es obligatorio
                        </Typography>
                      )}

                      {/* Mostrar descripción del tipo seleccionado (si existe) */}
                      {(() => {
                        const selected = tiposOptions.find(t => (t.id ?? t.value) === doctor.atr_id_tipo_medico);
                        if (selected) {
                          return (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="text.primary"><strong>Nombre:</strong> {selected.name}</Typography>
                              {selected.creadoPor && (
                                <Typography variant="caption" color="text.secondary">Creado por: {selected.creadoPor}</Typography>
                              )}
                              {selected.fechaCreacion && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Fecha creación: {new Date(selected.fechaCreacion).toLocaleString()}</Typography>
                              )}
                            </Box>
                          );
                        }
                        return null;
                      })()}
                  </FormControl>
                </Grid>
              </Grid>

              {/* Especialidades */}
              <Box className="dynamic-section">
                <Typography variant="subtitle1" className="section-title">
                  <MedicalIcon className="section-icon" />
                  Especialidades
                </Typography>
                {doctor.especialidades.map((especialidad, index) => (
                  <Box key={especialidad.id} className="dynamic-field">
                    <Autocomplete
                      options={especialidadesOptions}
                      getOptionLabel={(option) => option.name}
                      value={especialidadesOptions.find(o => o.id === especialidad.atr_id_especialidad) || null}
                      onChange={(event, newValue) => {
                        if (readOnly) return;
                        const name = newValue ? newValue.name : '';
                        const id = newValue ? newValue.id : null;
                        handleDynamicChange('especialidades', especialidad.id, 'atr_id_especialidad', id);
                        handleDynamicChange('especialidades', especialidad.id, 'atr_especialidad', name);
                      }}
                      disabled={readOnly}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={`Especialidad ${index + 1}`}
                          className="form-field"
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
                    />
                    {especialidadesError && (
                      <Typography variant="caption" color="error">
                        Error cargando especialidades: {especialidadesError}
                      </Typography>
                    )}
                    {!readOnly && doctor.especialidades.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveDynamicField('especialidades', especialidad.id)}
                        className="remove-btn"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                {!readOnly && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => handleAddDynamicField('especialidades')}
                    className="add-btn"
                  >
                    Agregar Especialidad
                  </Button>
                )}
              </Box>

              {/* Horarios de Atención */}
              <Box sx={{ mt: 3 }}>
                <DoctorSchedule value={doctor.horarios} onChange={handleHorariosChange} readOnly={readOnly} />
              </Box>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="form-card">
            <CardContent>
              <Typography variant="h6" className="step-title">
                <PhoneIcon className="step-icon" />
                Información de Contacto
              </Typography>
              <Divider className="step-divider" />
              
              {/* Mensaje informativo */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  La información de contacto es opcional. Puede agregarla ahora o más tarde.
                  Si agrega campos, asegúrese de completarlos o eliminarlos antes de continuar.
                </Typography>
              </Alert>

              {/* Teléfonos */}
              <Box className="dynamic-section">
                <Typography variant="subtitle1" className="section-title">
                  Teléfonos
                </Typography>
                {doctor.telefonos.map((telefono, index) => (
                  <Box key={telefono.id} className="dynamic-field">
                    <TextField
                      fullWidth
                      label={`Teléfono ${index + 1}`}
                      value={telefono.atr_telefono}
                      onChange={(e) => { if (!readOnly) handleDynamicChange('telefonos', telefono.id, 'atr_telefono', e.target.value); }}
                      disabled={readOnly}
                      className="form-field"
                    />
                    {!readOnly && doctor.telefonos.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveDynamicField('telefonos', telefono.id)}
                        className="remove-btn"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                {!readOnly && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => handleAddDynamicField('telefonos')}
                    className="add-btn"
                  >
                    Agregar Teléfono
                  </Button>
                )}
              </Box>

              {/* Direcciones */}
              <Box className="dynamic-section">
                <Typography variant="subtitle1" className="section-title">
                  <HomeIcon className="section-icon" />
                  Direcciones
                </Typography>
                {doctor.direcciones.map((direccion, index) => (
                  <Box key={direccion.id} className="dynamic-field">
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label={`Dirección ${index + 1}`}
                      value={direccion.atr_direccion_completa}
                      onChange={(e) => { if (!readOnly) handleDynamicChange('direcciones', direccion.id, 'atr_direccion_completa', e.target.value); }}
                      disabled={readOnly}
                      className="form-field"
                    />
                    {!readOnly && doctor.direcciones.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveDynamicField('direcciones', direccion.id)}
                        className="remove-btn"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                {!readOnly && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => handleAddDynamicField('direcciones')}
                    className="add-btn"
                  >
                    Agregar Dirección
                  </Button>
                )}
              </Box>

              {/* Correos */}
              <Box className="dynamic-section">
                <Typography variant="subtitle1" className="section-title">
                  <EmailIcon className="section-icon" />
                  Correos Electrónicos
                </Typography>
                {doctor.correos.map((correo, index) => (
                  <Box key={correo.id} className="dynamic-field">
                    <TextField
                      fullWidth
                      type="email"
                      label={`Correo ${index + 1}`}
                      value={correo.atr_correo}
                      onChange={(e) => { if (!readOnly) handleDynamicChange('correos', correo.id, 'atr_correo', e.target.value); }}
                      disabled={readOnly}
                      className="form-field"
                    />
                    {!readOnly && doctor.correos.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveDynamicField('correos', correo.id)}
                        className="remove-btn"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                {!readOnly && (
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => handleAddDynamicField('correos')}
                    className="add-btn"
                  >
                    Agregar Correo
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="form-card">
            <CardContent>
              <Typography variant="h6" className="step-title">
                <CheckIcon className="step-icon" />
                Confirmación de Datos
              </Typography>
              <Divider className="step-divider" />

              <Box className="confirmation-section">
                <Typography variant="subtitle1" className="confirmation-title">
                  Por favor, revise los datos antes de continuar:
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box className="data-group">
                      <Typography variant="subtitle2" className="data-label">
                        Información Personal
                      </Typography>
                      <Box className="data-item">
                        <strong>Nombre:</strong> {doctor.atr_nombre} {doctor.atr_apellido}
                      </Box>
                      <Box className="data-item">
                        <strong>Fecha de Nacimiento:</strong> {doctor.atr_fecha_nacimiento}
                      </Box>
                      <Box className="data-item">
                        <strong>Identidad:</strong> {doctor.atr_identidad}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box className="data-group">
                      <Typography variant="subtitle2" className="data-label">
                        Información Profesional
                      </Typography>
                      <Box className="data-item">
                        <strong>Número de Colegiado:</strong> {doctor.atr_numero_colegiado}
                      </Box>
                      <Box className="data-item">
                        <strong>Tipo de Médico:</strong> {
                          (() => {
                            const t = tiposOptions.find(t => (t.id ?? t.value) === doctor.atr_id_tipo_medico);
                            return t ? (t.name ?? t.label) : (!loadingTipos ? 'No seleccionado' : 'Cargando...');
                          })()
                        }
                      </Box>
                      <Box className="data-item">
                        <strong>Especialidades:</strong>
                        <Box className="specialties-list">
                          {doctor.especialidades.map((esp, index) => (
                            <Chip
                              key={index}
                              label={esp.atr_especialidad}
                              size="small"
                              className="specialty-chip"
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Box className="confirmation-actions">
                  <Chip
                    icon={<CheckIcon />}
                    label="Datos verificados"
                    color="success"
                    className="confirmation-chip"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const steps = [
    'Información Personal',
    'Información Profesional',
    'Información de Contacto',
    'Confirmación'
  ];

  return (
    <Dialog open={open} onClose={onClose || onCancel} fullWidth maxWidth="lg" fullScreen={isMobile} scroll="paper">
      <DialogTitle>
        <Box className="form-header">
          <Typography variant="h5" className="form-title">
            {initialData?.atr_id_medico ? 'Editar Médico' : 'Registro de Médico'}
          </Typography>
          <Typography variant="body2" className="form-subtitle">
            Complete la información del médico paso a paso
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Paper className="form-paper">
          <Stepper 
            activeStep={currentStep - 1} 
            alternativeLabel 
            className="form-stepper"
            sx={{ 
              display: isMobile ? 'none' : 'flex',
              marginBottom: 3 
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Mensaje informativo */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Instrucciones:</strong> Complete cada paso del formulario. Los campos marcados con <strong>*</strong> son obligatorios. 
              Puede avanzar al siguiente paso una vez que complete todos los campos requeridos del paso actual.
            </Typography>
          </Alert>

          {isMobile && (
            <Box className="mobile-progress">
              <Typography variant="body2" className="progress-text">
                Paso {currentStep} de {totalSteps}
              </Typography>
              <Box className="progress-bar">
                <Box 
                  className="progress-fill"
                  sx={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </Box>
            </Box>
          )}

          <Box className="form-content">
            {getStepContent(currentStep)}
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions>
        {!readOnly ? (
          <>
            <Button
              disabled={currentStep === 1}
              onClick={handleBack}
              className="back-btn"
              variant="outlined"
            >
              Anterior
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              className="next-btn"
              disabled={saving}
              endIcon={currentStep === totalSteps ? (saving ? <CircularProgress size={18} /> : <SaveIcon />) : null}
            >
              {currentStep === totalSteps ? (saving ? 'Guardando...' : 'Guardar Médico') : 'Siguiente'}
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={() => { if (onClose) onClose(); else if (onCancel) onCancel(); }}>Cerrar</Button>
        )}
      </DialogActions>

      <Snackbar
        open={notification?.open || false}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification?.type || 'info'}
          className="notification-alert"
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default DoctorRegistrationForm;

