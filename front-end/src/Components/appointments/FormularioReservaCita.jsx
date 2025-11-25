import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAppointment, fetchPatients, fetchDoctors } from '../../redux/appointments/appointmentsSlice';
import { getAppointmentTypes, getAppointmentStates, getUsers } from '../../services/appointmentService';
import CircularProgress from '@mui/material/CircularProgress';
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
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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

const FormularioReservaCita = ({ inModal = false, onSuccess = null, onClose = null }) => {
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
    estado: ''
  });

  // Estados para errores
  const [errors, setErrors] = useState({});

  // Estado para notificaciones
  const [notification, setNotification] = useState(null);

  // Datos cargados desde el backend (redux)
  const patients = useSelector(state => state.appointments.patients || []);
  const doctors = useSelector(state => state.appointments.doctors || []);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [appointmentStates, setAppointmentStates] = useState([]);
  const [appointmentUsers, setAppointmentUsers] = useState([]);
  const [defaultProgramadaId, setDefaultProgramadaId] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const dispatch = useDispatch();

  // Helpers para normalizar opciones que pueden venir como { value,label }
  const getOptionId = (item) => item?.value ?? item?.atr_id_paciente ?? item?.atr_id_medico ?? item?.atr_id ?? item?.id ?? null;
  const getPersonLabel = (item) => item?.label ?? (item?.atr_nombre ? `${item.atr_nombre} ${item.atr_apellido || ''}`.trim() : (item?.nombre || item?.name || 'Sin nombre'));
  const getPersonIdentity = (item) => item?.atr_identidad ?? item?.identidad ?? item?.documento ?? '';
  const getTypeId = (item) => item?.value ?? item?.atr_id_tipo_cita ?? item?.id ?? null;
  const getTypeLabel = (item) => item?.label ?? item?.atr_nombre_tipo_cita ?? item?.name ?? 'Tipo';

  // Cargar pacientes, médicos y tipos al montar
  React.useEffect(() => {
    try {
      dispatch(fetchPatients());
      dispatch(fetchDoctors());
    } catch (e) {
      // no-op
    }

    const loadTypes = async () => {
      try {
        const res = await getAppointmentTypes();
        const types = res?.data?.data || [];
        setAppointmentTypes(types);
      } catch (err) {
        console.error('Error loading appointment types:', err);
      }
    };
    const loadStates = async () => {
      try {
        const res = await getAppointmentStates();
        const states = res?.data?.data || [];
        setAppointmentStates(states);
        // Si encontramos PROGRAMADA, seleccionar por defecto su ID
        const programada = states.find(s => String(s.label).toUpperCase() === 'PROGRAMADA');
        if (programada) {
          const idStr = String(programada.value);
          setDefaultProgramadaId(idStr);
          setFormData(prev => ({ ...prev, estado: idStr }));
        }
      } catch (err) {
        console.error('Error loading appointment states:', err);
      }
    };
    const loadUsers = async () => {
      try {
        // Pedimos un listado corto (limit) para poblar el select
        const res = await getUsers({ page: 1, limit: 200 });
        const users = res?.data?.data || [];
        setAppointmentUsers(users);
      } catch (err) {
        console.error('Error loading users for appointment form:', err);
      }
    };
    loadTypes();
    loadStates();
    loadUsers();
  }, [dispatch]);

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
      // Preparar payload para el backend
      const payload = {
        pacienteId: parseInt(formData.paciente) || null,
        medicoId: parseInt(formData.medico) || null,
        fecha: formData.fecha_cita,
        hora: formData.hora_cita,
        usuarioId: formData.usuario ? (isNaN(parseInt(formData.usuario)) ? null : parseInt(formData.usuario)) : null,
        usuario: formData.usuario ? (isNaN(parseInt(formData.usuario)) ? null : parseInt(formData.usuario)) : null,
        tipoCitaId: isNaN(parseInt(formData.tipo_cita)) ? null : parseInt(formData.tipo_cita),
        tipoCita: isNaN(parseInt(formData.tipo_cita)) ? null : parseInt(formData.tipo_cita),
        motivo: formData.motivo_cita,
        estado: formData.estado || 'PROGRAMADA',
        duracion: formData.duracion ? parseInt(formData.duracion) : 60
      };

      (async () => {
        setSubmitting(true);
        try {
          const resultAction = await dispatch(createAppointment(payload));
          if (createAppointment.fulfilled.match(resultAction)) {
            showNotification('Cita reservada exitosamente!', 'success');
            // Resetear formulario
            setFormData({
              paciente: '',
              medico: '',
              usuario: '',
              fecha_cita: '',
              hora_cita: '',
              motivo_cita: '',
              tipo_cita: '',
              estado: defaultProgramadaId || ''
            });
            setErrors({});
            if (typeof onSuccess === 'function') onSuccess(resultAction.payload);
          } else {
            const err = resultAction.payload || resultAction.error;
            console.error('Error creating appointment:', err);
            showNotification(typeof err === 'string' ? err : (err?.message || 'Error al crear cita'), 'error');
          }
        } catch (err) {
          console.error('Unexpected error creating appointment:', err);
          showNotification(err?.message || 'Error al crear cita', 'error');
        } finally {
          setSubmitting(false);
        }
      })();
    } else {
      showNotification('Por favor, corrija los errores en el formulario.', 'error');
    }
  };

  // Función para obtener el paciente seleccionado
  const getPacienteSeleccionado = () => {
    const selectedId = formData.paciente;
    if (!selectedId) return null;
    return patients.find(p => String(p.value ?? p.atr_id_paciente ?? p.id ?? p.atr_id) === String(selectedId));
  };

  // Función para obtener el médico seleccionado
  const getMedicoSeleccionado = () => {
    const selectedId = formData.medico;
    if (!selectedId) return null;
    return doctors.find(m => String(m.value ?? m.atr_id_medico ?? m.id ?? m.atr_id) === String(selectedId));
  };

  const FormHeader = (
    <Box className="form-header">
        <Typography variant="h4" className="form-title">
          <CalendarIcon className="header-icon" />
          Reserva de Cita Médica
        </Typography>
        <Typography variant="body1" className="form-subtitle">
          Complete la información para agendar una nueva cita
        </Typography>
        </Box>
      );

      const FormBody = (
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
                      {patients.map(paciente => {
                        const id = getOptionId(paciente);
                        const nombre = getPersonLabel(paciente);
                        const identidad = getPersonIdentity(paciente);
                        return (
                          <MenuItem key={id ?? nombre} value={id}>
                            {nombre} {identidad ? `- ${identidad}` : ''}
                          </MenuItem>
                        );
                      })}
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
                        label={`Paciente: ${getPersonLabel(getPacienteSeleccionado())}`}
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
                      {doctors.map(medico => {
                        const id = getOptionId(medico);
                        const nombre = getPersonLabel(medico);
                        const especialidad = medico.atr_especialidad || medico.especialidad || medico.specialty || '';
                        return (
                          <MenuItem key={id ?? nombre} value={id}>
                            {nombre} {especialidad ? `- ${especialidad}` : ''}
                          </MenuItem>
                        );
                      })}
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
                        label={`Médico: ${getPersonLabel(getMedicoSeleccionado())}`}
                        color="secondary"
                        className="info-chip"
                      />
                      { (getMedicoSeleccionado().atr_especialidad || getMedicoSeleccionado().especialidad || getMedicoSeleccionado().specialty) && (
                        <Chip
                          label={`Especialidad: ${getMedicoSeleccionado().atr_especialidad || getMedicoSeleccionado().especialidad || getMedicoSeleccionado().specialty}`}
                          variant="outlined"
                          className="info-chip"
                        />
                      )}
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
                      <FormControl fullWidth className="form-field" error={!!errors.tipo_cita}>
                        <InputLabel>Tipo de Cita</InputLabel>
                        <Select
                          name="tipo_cita"
                          value={formData.tipo_cita}
                          onChange={(e) => {
                            handleChange(e);
                          }}
                          label="Tipo de Cita"
                          required
                        >
                          {appointmentTypes.length > 0 ? (
                            appointmentTypes.map(tipo => {
                              const id = getTypeId(tipo);
                              const label = getTypeLabel(tipo);
                              return (
                                <MenuItem key={id ?? label} value={id}>
                                  {label}
                                </MenuItem>
                              );
                            })
                          ) : (
                            tiposCita.map((t, idx) => (
                              <MenuItem key={idx} value={t}>{t}</MenuItem>
                            ))
                          )}
                        </Select>
                        {errors.tipo_cita && (
                          <Typography variant="caption" className="error-text">
                            {errors.tipo_cita}
                          </Typography>
                        )}
                      </FormControl>
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
                          {appointmentStates.length > 0 ? (
                            appointmentStates.map(estado => (
                              <MenuItem key={estado.value} value={String(estado.value)}>
                                {estado.label}
                              </MenuItem>
                            ))
                          ) : (
                            estadosCita.map(estado => (
                              <MenuItem key={estado.value} value={estado.value}>
                                {estado.label}
                              </MenuItem>
                            ))
                          )}
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
                            {appointmentUsers.length > 0 ? (
                              appointmentUsers.map(u => (
                                <MenuItem key={u.atr_id_usuario} value={String(u.atr_id_usuario)}>
                                  {u.atr_nombre_usuario || u.atr_usuario} {u.atr_correo_electronico ? `- ${u.atr_correo_electronico}` : ''}
                                </MenuItem>
                              ))
                            ) : (
                              usuarios.map(usuario => (
                                <MenuItem key={usuario.id} value={usuario.id}>
                                  {usuario.nombre} - {usuario.rol}
                                </MenuItem>
                              ))
                            )}
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
                              label={`Tipo: ${(() => {
                                const sel = appointmentTypes.find(t => String(getTypeId(t)) === String(formData.tipo_cita));
                                if (sel) return getTypeLabel(sel) || formData.tipo_cita;
                                return formData.tipo_cita;
                              })()}`}
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
                  estado: defaultProgramadaId || ''
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
              endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Reservando...' : 'Reservar Cita'}
            </Button>
          </Box>
    </form>
  );

  const SnackbarNode = (
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
  );

  if (inModal) {
    return (
      <Dialog open={true} onClose={() => { if (typeof onClose === 'function') onClose(); }} fullWidth maxWidth="lg">
        <DialogTitle>
          {FormHeader}
        </DialogTitle>
        <DialogContent dividers>
          {FormBody}
          {SnackbarNode}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Container maxWidth="lg" className="appointment-form-container">
      {FormHeader}
      <Paper className="form-paper">
        {FormBody}
      </Paper>
      {SnackbarNode}
    </Container>
  );
};

export default FormularioReservaCita;