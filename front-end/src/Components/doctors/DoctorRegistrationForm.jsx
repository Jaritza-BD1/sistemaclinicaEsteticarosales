import React, { useState } from 'react';
import {
  Box,
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
import './DoctorRegistrationForm.css';

function DoctorRegistrationForm({ initialData = {}, onSave, onCancel }) {
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
  const [doctor, setDoctor] = useState({
    atr_nombre: initialData.atr_nombre || '',
    atr_apellido: initialData.atr_apellido || '',
    atr_fecha_nacimiento: convertDateFormat(initialData.atr_fecha_nacimiento) || '',
    atr_identidad: initialData.atr_identidad || '',
    atr_id_genero: initialData.atr_id_genero || '',
    atr_numero_colegiado: initialData.atr_numero_colegiado || '',
    atr_id_tipo_medico: initialData.atr_id_tipo_medico || '',
    telefonos: initialData.telefonos || [],
    direcciones: initialData.direcciones || [],
    correos: initialData.correos || [],
    especialidades: initialData.especialidades || [{ id: 1, atr_especialidad: '' }],
  });

  // Estado para el paso actual del formulario
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Estado para notificaciones
  const [notification, setNotification] = useState(null);

  // Datos simulados para selectores
  const mockGeneros = [
    { id: 1, name: 'Masculino' },
    { id: 2, name: 'Femenino' },
    { id: 3, name: 'Otro' },
  ];

  const mockTiposMedico = [
    { id: 1, name: 'Médico General' },
    { id: 2, name: 'Especialista' },
    { id: 3, name: 'Cirujano' },
    { id: 4, name: 'Residente' },
  ];

  const mockEspecialidades = [
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
    'Oncología',
    'Endocrinología',
    'Gastroenterología',
    'Neumología',
    'Reumatología',
  ];

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, open: true });
  };

  // Función para cerrar notificaciones
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Función para debug - mostrar estado actual
  const debugFormState = () => {
    console.log('🔍 DEBUG - Estado actual del formulario:');
    console.log('📋 Datos del médico:', doctor);
    console.log('📍 Paso actual:', currentStep);
    console.log('📅 Fecha convertida:', convertDateFormat('05/06/1993'));
  };

  // Función para avanzar automáticamente (solo para pruebas)
  const autoAdvance = () => {
    console.log('🚀 Avanzando automáticamente a través de todos los pasos...');
    setCurrentStep(4); // Ir directamente al paso de confirmación
  };

  // Función para ir al paso de contacto (solo para pruebas)
  const goToContactStep = () => {
    console.log('📞 Yendo al paso de información de contacto...');
    setCurrentStep(3);
  };

  // Función para probar la validación directamente
  const testValidation = () => {
    console.log('🧪 Probando validación del paso actual...');
    console.log('📍 Paso actual:', currentStep);
    console.log('📋 Datos del doctor:', doctor);
    
    const result = validateCurrentStep();
    console.log('✅ Resultado de la prueba:', result);
    
    if (result) {
      showNotification('✅ Validación exitosa - el formulario puede avanzar', 'success');
    } else {
      showNotification('❌ Validación falló - revisa los campos requeridos', 'error');
    }
  };

  // Función para forzar el avance (solo para pruebas)
  const forceAdvance = () => {
    console.log('🚀 Forzando avance al siguiente paso...');
    console.log('📍 Paso actual:', currentStep);
    
    if (currentStep < totalSteps) {
      console.log('✅ Forzando avance al paso:', currentStep + 1);
      setCurrentStep(currentStep + 1);
      showNotification(`✅ Avanzado al paso ${currentStep + 1}`, 'success');
    } else {
      console.log('✅ Forzando envío del formulario');
      handleSubmit();
    }
  };

  // Función para limpiar campos vacíos
  const cleanEmptyFields = () => {
    setDoctor(prevDoctor => ({
      ...prevDoctor,
      telefonos: prevDoctor.telefonos.filter(t => t.atr_telefono.trim() !== ''),
      direcciones: prevDoctor.direcciones.filter(d => d.atr_direccion_completa.trim() !== ''),
      correos: prevDoctor.correos.filter(c => c.atr_correo.trim() !== '')
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
        
        if (!doctor.atr_nombre.trim()) {
          console.log('❌ Error: Nombre vacío');
          showNotification('Por favor, ingrese el nombre del médico.', 'error');
          return false;
        }
        
        if (!doctor.atr_apellido.trim()) {
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
        
        if (!doctor.atr_identidad.trim()) {
          console.log('❌ Error: Identidad vacía');
          showNotification('Por favor, ingrese el número de identidad.', 'error');
          return false;
        }
        
        if (!/^\d{13}$/.test(doctor.atr_identidad)) {
          console.log('❌ Error: Identidad inválida');
          showNotification('El número de identidad debe contener exactamente 13 dígitos numéricos.', 'error');
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
        
        if (!doctor.atr_numero_colegiado.trim()) {
          console.log('❌ Error: Número de colegiado vacío');
          showNotification('Por favor, ingrese el número de colegiado del médico.', 'error');
          return false;
        }
        
        if (!doctor.atr_id_tipo_medico) {
          console.log('❌ Error: Tipo de médico no seleccionado');
          showNotification('Por favor, seleccione el tipo de médico.', 'error');
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
          const hasValidTelefono = doctor.telefonos.some(t => t.atr_telefono.trim() !== '');
          if (!hasValidTelefono) {
            console.log('❌ Error: No hay teléfonos válidos');
            showNotification('Por favor, ingrese al menos un número de teléfono válido o elimine los campos vacíos.', 'error');
            return false;
          }
        }
        
        // Verificar direcciones si existen
        if (doctor.direcciones.length > 0) {
          const hasValidDireccion = doctor.direcciones.some(d => d.atr_direccion_completa.trim() !== '');
          if (!hasValidDireccion) {
            console.log('❌ Error: No hay direcciones válidas');
            showNotification('Por favor, ingrese al menos una dirección o elimine los campos vacíos.', 'error');
            return false;
          }
        }
        
        // Verificar correos si existen
        if (doctor.correos.length > 0) {
          const hasValidCorreo = doctor.correos.some(c => c.atr_correo.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.atr_correo));
          if (!hasValidCorreo) {
            console.log('❌ Error: No hay correos válidos');
            showNotification('Por favor, ingrese al menos un correo electrónico válido o elimine los campos vacíos.', 'error');
            return false;
          }
        }
        
        console.log('✅ Información de Contacto válida');
        break;
      case 4: // Confirmación
        console.log('✅ Confirmación - sin validación');
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
    setDoctor(prevDoctor => ({
      ...prevDoctor,
      [name]: value
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
    const newId = Math.max(...doctor[type].map(item => item.id)) + 1;
    setDoctor(prevDoctor => ({
      ...prevDoctor,
      [type]: [...prevDoctor[type], { id: newId, [type === 'especialidades' ? 'atr_especialidad' : `atr_${type.slice(0, -1)}`]: '' }]
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

  // Función para manejar el envío del formulario
  const handleSubmit = () => {
    if (validateCurrentStep()) {
      // Filtrar campos vacíos
      const cleanDoctor = {
        ...doctor,
        telefonos: doctor.telefonos.filter(t => t.atr_telefono.trim() !== ''),
        direcciones: doctor.direcciones.filter(d => d.atr_direccion_completa.trim() !== ''),
        correos: doctor.correos.filter(c => c.atr_correo.trim() !== ''),
        especialidades: doctor.especialidades.filter(e => e.atr_especialidad.trim() !== ''),
      };

      if (onSave) {
        onSave(cleanDoctor);
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
                    className="form-field"
                    required
                    error={!doctor.atr_nombre.trim()}
                    helperText={!doctor.atr_nombre.trim() ? "El nombre es obligatorio" : ""}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Apellido *"
                    name="atr_apellido"
                    value={doctor.atr_apellido}
                    onChange={handleChange}
                    className="form-field"
                    required
                    error={!doctor.atr_apellido.trim()}
                    helperText={!doctor.atr_apellido.trim() ? "El apellido es obligatorio" : ""}
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
                    className="form-field"
                    required
                    inputProps={{ maxLength: 13 }}
                    error={!doctor.atr_identidad.trim() || (doctor.atr_identidad && !/^\d{13}$/.test(doctor.atr_identidad))}
                    helperText={
                      !doctor.atr_identidad.trim() 
                        ? "La identidad es obligatoria" 
                        : (doctor.atr_identidad && !/^\d{13}$/.test(doctor.atr_identidad))
                          ? "Debe contener exactamente 13 dígitos"
                          : ""
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
                      label="Género *"
                    >
                      {mockGeneros.map(genero => (
                        <MenuItem key={genero.id} value={genero.id}>
                          {genero.name}
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
                    className="form-field"
                    required
                    error={!doctor.atr_numero_colegiado.trim()}
                    helperText={!doctor.atr_numero_colegiado.trim() ? "El número de colegiado es obligatorio" : ""}
                    InputProps={{
                      endAdornment: (
                        <Button
                          size="small"
                          onClick={generateColegiado}
                          className="generate-btn"
                        >
                          Generar
                        </Button>
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
                      label="Tipo de Médico *"
                      required
                    >
                      {mockTiposMedico.map(tipo => (
                        <MenuItem key={tipo.id} value={tipo.id}>
                          {tipo.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {!doctor.atr_id_tipo_medico && (
                      <Typography variant="caption" color="error">
                        El tipo de médico es obligatorio
                      </Typography>
                    )}
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
                      freeSolo
                      options={mockEspecialidades}
                      value={especialidad.atr_especialidad}
                      onChange={(event, newValue) => {
                        handleDynamicChange('especialidades', especialidad.id, 'atr_especialidad', newValue || '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={`Especialidad ${index + 1}`}
                          className="form-field"
                        />
                      )}
                    />
                    {doctor.especialidades.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveDynamicField('especialidades', especialidad.id)}
                        className="remove-btn"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => handleAddDynamicField('especialidades')}
                  className="add-btn"
                >
                  Agregar Especialidad
                </Button>
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
                      onChange={(e) => handleDynamicChange('telefonos', telefono.id, 'atr_telefono', e.target.value)}
                      className="form-field"
                    />
                    {doctor.telefonos.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveDynamicField('telefonos', telefono.id)}
                        className="remove-btn"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => handleAddDynamicField('telefonos')}
                  className="add-btn"
                >
                  Agregar Teléfono
                </Button>
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
                      onChange={(e) => handleDynamicChange('direcciones', direccion.id, 'atr_direccion_completa', e.target.value)}
                      className="form-field"
                    />
                    {doctor.direcciones.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveDynamicField('direcciones', direccion.id)}
                        className="remove-btn"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => handleAddDynamicField('direcciones')}
                  className="add-btn"
                >
                  Agregar Dirección
                </Button>
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
                      onChange={(e) => handleDynamicChange('correos', correo.id, 'atr_correo', e.target.value)}
                      className="form-field"
                    />
                    {doctor.correos.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveDynamicField('correos', correo.id)}
                        className="remove-btn"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => handleAddDynamicField('correos')}
                  className="add-btn"
                >
                  Agregar Correo
                </Button>
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
                          mockTiposMedico.find(t => t.id === doctor.atr_id_tipo_medico)?.name || 'No seleccionado'
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
    <Container maxWidth="lg" className="doctor-form-container">
      <Box className="form-header">
        <Typography variant="h4" className="form-title">
          {initialData.atr_id_medico ? 'Editar Médico' : 'Registro de Médico'}
        </Typography>
        <Typography variant="body1" className="form-subtitle">
          Complete la información del médico paso a paso
        </Typography>
      </Box>

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
          {steps.map((label, index) => (
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

        <Box className="form-actions">
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
            endIcon={currentStep === totalSteps ? <SaveIcon /> : null}
          >
            {currentStep === totalSteps ? 'Guardar Médico' : 'Siguiente'}
          </Button>
        </Box>
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
          className="notification-alert"
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default DoctorRegistrationForm;

