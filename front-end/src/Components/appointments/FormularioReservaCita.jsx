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
  Chip,
  useTheme,
  useMediaQuery,
  Autocomplete
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  MedicalServices as MedicalIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import './FormularioReservaCita.css';

const FormularioReservaCita = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    paciente: '',
    medico: '',
    usuario: '',
    fecha_cita: '',
    hora_cita: '',
    motivo_cita: '',
    tipo_cita: '',
    estado: 'programada'
  });

  // Estados para errores
  const [errors, setErrors] = useState({});

  // Estado para notificaciones
  const [notification, setNotification] = useState(null);

  // Datos de ejemplo (en una aplicación real vendrían de una API)
  const pacientes = [
    { id: 1, nombre: 'María Rodríguez', identidad: '0801199501234' },
    { id: 2, nombre: 'Carlos Pérez', identidad: '0802199405678' },
    { id: 3, nombre: 'Ana Martínez', identidad: '0803199309012' },
    { id: 4, nombre: 'Luis González', identidad: '0804199203456' },
    { id: 5, nombre: 'Sofía Herrera', identidad: '0805199107890' }
  ];

  const medicos = [
    { id: 1, nombre: 'Dr. Juan López', especialidad: 'Cardiología' },
    { id: 2, nombre: 'Dra. Sofía García', especialidad: 'Pediatría' },
    { id: 3, nombre: 'Dr. Miguel Torres', especialidad: 'Dermatología' },
    { id: 4, nombre: 'Dra. Carmen Ruiz', especialidad: 'Ginecología' },
    { id: 5, nombre: 'Dr. Roberto Silva', especialidad: 'Ortopedia' }
  ];

  const usuarios = [
    { id: 1, nombre: 'admin', rol: 'Administrador' },
    { id: 2, nombre: 'recepcion', rol: 'Recepcionista' },
    { id: 3, nombre: 'asistente', rol: 'Asistente Médico' },
    { id: 4, nombre: 'enfermera', rol: 'Enfermera' }
  ];

  const tiposCita = [
    'Consulta General',
    'Control',
    'Emergencia',
    'Examen',
    'Cirugía',
    'Terapia',
    'Seguimiento',
    'Revisión',
    'Procedimiento',
    'Consulta Especializada'
  ];

  const estadosCita = [
    { value: 'programada', label: 'Programada' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'reprogramada', label: 'Reprogramada' }
  ];

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, open: true });
  };

  // Función para cerrar notificaciones
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validación en tiempo real
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    const hoy = new Date();
    
    // Validar paciente
    if (!formData.paciente) {
      newErrors.paciente = 'Debe seleccionar un paciente';
    }
    
    // Validar médico
    if (!formData.medico) {
      newErrors.medico = 'Debe seleccionar un médico';
    }
    
    // Validar fecha de cita
    if (!formData.fecha_cita) {
      newErrors.fecha_cita = 'Debe seleccionar una fecha';
    } else {
      const fechaCita = new Date(formData.fecha_cita);
      if (fechaCita < hoy.setHours(0, 0, 0, 0)) {
        newErrors.fecha_cita = 'La fecha no puede ser anterior a hoy';
      }
    }
    
    // Validar hora de cita
    if (!formData.hora_cita) {
      newErrors.hora_cita = 'Debe seleccionar una hora';
    }
    
    // Validar motivo de cita
    if (!formData.motivo_cita.trim()) {
      newErrors.motivo_cita = 'Debe ingresar un motivo para la cita';
    }
    
    // Validar tipo de cita
    if (!formData.tipo_cita) {
      newErrors.tipo_cita = 'Debe seleccionar un tipo de cita';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Aquí iría la lógica para enviar los datos a tu API
      console.log('Datos de la cita a enviar:', formData);
      showNotification('Cita reservada exitosamente!', 'success');
      
      // Resetear formulario después del envío exitoso
      setFormData({
        paciente: '',
        medico: '',
        usuario: '',
        fecha_cita: '',
        hora_cita: '',
        motivo_cita: '',
        tipo_cita: '',
        estado: 'programada'
      });
      setErrors({});
    } else {
      showNotification('Por favor, corrija los errores en el formulario.', 'error');
    }
  };

  // Función para obtener el paciente seleccionado
  const getPacienteSeleccionado = () => {
    return pacientes.find(p => p.id === parseInt(formData.paciente));
  };

  // Función para obtener el médico seleccionado
  const getMedicoSeleccionado = () => {
    return medicos.find(m => m.id === parseInt(formData.medico));
  };

  return (
    <Container maxWidth="lg" className="appointment-form-container">
      <Box className="form-header">
        <Typography variant="h4" className="form-title">
          <CalendarIcon className="header-icon" />
          Reserva de Cita Médica
        </Typography>
        <Typography variant="body1" className="form-subtitle">
          Complete la información para agendar una nueva cita
        </Typography>
      </Box>

      <Paper className="form-paper">
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Selección de Paciente */}
            <Grid item xs={12} md={6}>
              <Card className="form-card">
                <CardContent>
                  <Typography variant="h6" className="card-title">
                    <PersonIcon className="card-icon" />
                    Información del Paciente
                  </Typography>
                  <Divider className="card-divider" />
                  
                  <FormControl fullWidth className="form-field" error={!!errors.paciente}>
                    <InputLabel>Paciente</InputLabel>
                    <Select
                      name="paciente"
                      value={formData.paciente}
                      onChange={handleChange}
                      label="Paciente"
                      required
                    >
                      {pacientes.map(paciente => (
                        <MenuItem key={paciente.id} value={paciente.id}>
                          {paciente.nombre} - {paciente.identidad}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.paciente && (
                      <Typography variant="caption" className="error-text">
                        {errors.paciente}
                      </Typography>
                    )}
                  </FormControl>

                  {getPacienteSeleccionado() && (
                    <Box className="selected-info">
                      <Chip
                        label={`Paciente: ${getPacienteSeleccionado().nombre}`}
                        color="primary"
                        className="info-chip"
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Selección de Médico */}
            <Grid item xs={12} md={6}>
              <Card className="form-card">
                <CardContent>
                  <Typography variant="h6" className="card-title">
                    <MedicalIcon className="card-icon" />
                    Información del Médico
                  </Typography>
                  <Divider className="card-divider" />
                  
                  <FormControl fullWidth className="form-field" error={!!errors.medico}>
                    <InputLabel>Médico</InputLabel>
                    <Select
                      name="medico"
                      value={formData.medico}
                      onChange={handleChange}
                      label="Médico"
                      required
                    >
                      {medicos.map(medico => (
                        <MenuItem key={medico.id} value={medico.id}>
                          {medico.nombre} - {medico.especialidad}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.medico && (
                      <Typography variant="caption" className="error-text">
                        {errors.medico}
                      </Typography>
                    )}
                  </FormControl>

                  {getMedicoSeleccionado() && (
                    <Box className="selected-info">
                      <Chip
                        label={`Médico: ${getMedicoSeleccionado().nombre}`}
                        color="secondary"
                        className="info-chip"
                      />
                      <Chip
                        label={`Especialidad: ${getMedicoSeleccionado().especialidad}`}
                        variant="outlined"
                        className="info-chip"
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Fecha y Hora */}
            <Grid item xs={12} md={6}>
              <Card className="form-card">
                <CardContent>
                  <Typography variant="h6" className="card-title">
                    <CalendarIcon className="card-icon" />
                    Fecha y Hora
                  </Typography>
                  <Divider className="card-divider" />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Fecha de Cita"
                        name="fecha_cita"
                        type="date"
                        value={formData.fecha_cita}
                        onChange={handleChange}
                        className="form-field"
                        required
                        error={!!errors.fecha_cita}
                        helperText={errors.fecha_cita}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Hora de Cita"
                        name="hora_cita"
                        type="time"
                        value={formData.hora_cita}
                        onChange={handleChange}
                        className="form-field"
                        required
                        error={!!errors.hora_cita}
                        helperText={errors.hora_cita}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Tipo y Estado */}
            <Grid item xs={12} md={6}>
              <Card className="form-card">
                <CardContent>
                  <Typography variant="h6" className="card-title">
                    <ScheduleIcon className="card-icon" />
                    Tipo y Estado
                  </Typography>
                  <Divider className="card-divider" />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        options={tiposCita}
                        value={formData.tipo_cita}
                        onChange={(event, newValue) => {
                          setFormData({ ...formData, tipo_cita: newValue || '' });
                          if (errors.tipo_cita) {
                            setErrors({ ...errors, tipo_cita: '' });
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Tipo de Cita"
                            className="form-field"
                            required
                            error={!!errors.tipo_cita}
                            helperText={errors.tipo_cita}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth className="form-field">
                        <InputLabel>Estado</InputLabel>
                        <Select
                          name="estado"
                          value={formData.estado}
                          onChange={handleChange}
                          label="Estado"
                        >
                          {estadosCita.map(estado => (
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

            {/* Motivo de la Cita */}
            <Grid item xs={12}>
              <Card className="form-card">
                <CardContent>
                  <Typography variant="h6" className="card-title">
                    <DescriptionIcon className="card-icon" />
                    Motivo de la Cita
                  </Typography>
                  <Divider className="card-divider" />
                  
                  <TextField
                    fullWidth
                    label="Motivo de la Cita"
                    name="motivo_cita"
                    value={formData.motivo_cita}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    className="form-field"
                    required
                    error={!!errors.motivo_cita}
                    helperText={errors.motivo_cita || "Describa el motivo de la consulta"}
                    placeholder="Describa los síntomas, motivo de consulta o procedimiento a realizar..."
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Información Adicional */}
            <Grid item xs={12}>
              <Card className="form-card">
                <CardContent>
                  <Typography variant="h6" className="card-title">
                    <CheckIcon className="card-icon" />
                    Información Adicional
                  </Typography>
                  <Divider className="card-divider" />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth className="form-field">
                        <InputLabel>Usuario Responsable</InputLabel>
                        <Select
                          name="usuario"
                          value={formData.usuario}
                          onChange={handleChange}
                          label="Usuario Responsable"
                        >
                          {usuarios.map(usuario => (
                            <MenuItem key={usuario.id} value={usuario.id}>
                              {usuario.nombre} - {usuario.rol}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box className="appointment-summary">
                        <Typography variant="subtitle2" className="summary-title">
                          Resumen de la Cita:
                        </Typography>
                        <Box className="summary-items">
                          {formData.fecha_cita && (
                            <Chip
                              label={`Fecha: ${formData.fecha_cita}`}
                              size="small"
                              className="summary-chip"
                            />
                          )}
                          {formData.hora_cita && (
                            <Chip
                              label={`Hora: ${formData.hora_cita}`}
                              size="small"
                              className="summary-chip"
                            />
                          )}
                          {formData.tipo_cita && (
                            <Chip
                              label={`Tipo: ${formData.tipo_cita}`}
                              size="small"
                              className="summary-chip"
                            />
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Botones de Acción */}
          <Box className="form-actions">
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setFormData({
                  paciente: '',
                  medico: '',
                  usuario: '',
                  fecha_cita: '',
                  hora_cita: '',
                  motivo_cita: '',
                  tipo_cita: '',
                  estado: 'programada'
                });
                setErrors({});
              }}
              className="clear-btn"
            >
              Limpiar Formulario
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              endIcon={<SaveIcon />}
              className="submit-btn"
            >
              Reservar Cita
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
          className="notification-alert"
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FormularioReservaCita;