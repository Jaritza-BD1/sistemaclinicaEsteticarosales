import React, { useState } from 'react';
import {
  Box, Paper, Typography, Stepper, Step, StepLabel, TextField, Button, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert
} from '@mui/material';

const pacientes = [
  { id: 1, nombre: 'María Rodríguez', identidad: '0801199501234' },
  { id: 2, nombre: 'Carlos Pérez', identidad: '0802199405678' },
  { id: 3, nombre: 'Ana Martínez', identidad: '0803199309012' }
];
const medicos = [
  { id: 1, nombre: 'Dr. Juan López', especialidad: 'Cardiología' },
  { id: 2, nombre: 'Dra. Sofía García', especialidad: 'Pediatría' },
  { id: 3, nombre: 'Dr. Miguel Torres', especialidad: 'Dermatología' }
];
const usuarios = [
  { id: 1, nombre: 'admin', rol: 'Administrador' },
  { id: 2, nombre: 'recepcion', rol: 'Recepcionista' },
  { id: 3, nombre: 'asistente', rol: 'Asistente Médico' }
];
const tiposCita = [
  'Consulta General', 'Control', 'Emergencia', 'Examen', 'Cirugía', 'Terapia', 'Seguimiento'
];

const steps = ['Seleccionar Paciente', 'Datos de la Cita', 'Confirmar y Reservar'];

const ScheduleAppointment = ({ onAppointmentScheduled, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    paciente: '', medico: '', usuario: '', fecha_cita: '', hora_cita: '', motivo_cita: '', tipo_cita: '', estado: 'programada'
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Validaciones por paso
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!formData.paciente) newErrors.paciente = 'Debe seleccionar un paciente';
    }
    if (step === 1) {
      if (!formData.medico) newErrors.medico = 'Debe seleccionar un médico';
      if (!formData.usuario) newErrors.usuario = 'Debe seleccionar un usuario';
      if (!formData.fecha_cita) newErrors.fecha_cita = 'La fecha es requerida';
      else {
        const fechaCita = new Date(formData.fecha_cita);
        const hoy = new Date(); hoy.setHours(0,0,0,0);
        if (fechaCita < hoy) newErrors.fecha_cita = 'La fecha no puede ser pasada';
      }
      if (!formData.hora_cita) newErrors.hora_cita = 'La hora es requerida';
      if (!formData.tipo_cita) newErrors.tipo_cita = 'Debe seleccionar un tipo de cita';
      if (!formData.motivo_cita.trim()) newErrors.motivo_cita = 'El motivo es requerido';
      else if (formData.motivo_cita.trim().length < 10) newErrors.motivo_cita = 'Debe tener al menos 10 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(1)) setActiveStep(2);
  };

  const handleConfirm = () => {
    if (onAppointmentScheduled) onAppointmentScheduled({ ...formData, id: Date.now().toString() });
    setSnackbar({ open: true, message: 'Cita reservada correctamente!', severity: 'success' });
    setTimeout(() => {
      if (onClose) onClose();
    }, 1200);
  };

  // Renderizado de cada paso
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Paciente</InputLabel>
              <Select
                name="paciente"
                value={formData.paciente}
                onChange={handleChange}
                label="Paciente"
                error={!!errors.paciente}
              >
                <MenuItem value=""><em>Seleccione un paciente...</em></MenuItem>
                {pacientes.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.nombre} - {p.identidad}</MenuItem>
                ))}
              </Select>
              {errors.paciente && <Typography color="error" variant="caption">{errors.paciente}</Typography>}
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Médico</InputLabel>
              <Select
                name="medico"
                value={formData.medico}
                onChange={handleChange}
                label="Médico"
                error={!!errors.medico}
              >
                <MenuItem value=""><em>Seleccione un médico...</em></MenuItem>
                {medicos.map(m => (
                  <MenuItem key={m.id} value={m.id}>{m.nombre} - {m.especialidad}</MenuItem>
                ))}
              </Select>
              {errors.medico && <Typography color="error" variant="caption">{errors.medico}</Typography>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Usuario</InputLabel>
              <Select
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                label="Usuario"
                error={!!errors.usuario}
              >
                <MenuItem value=""><em>Seleccione un usuario...</em></MenuItem>
                {usuarios.map(u => (
                  <MenuItem key={u.id} value={u.id}>{u.nombre} ({u.rol})</MenuItem>
                ))}
              </Select>
              {errors.usuario && <Typography color="error" variant="caption">{errors.usuario}</Typography>}
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Tipo de Cita</InputLabel>
              <Select
                name="tipo_cita"
                value={formData.tipo_cita}
                onChange={handleChange}
                label="Tipo de Cita"
                error={!!errors.tipo_cita}
              >
                <MenuItem value=""><em>Seleccione un tipo...</em></MenuItem>
                {tiposCita.map((tipo, idx) => (
                  <MenuItem key={idx} value={tipo}>{tipo}</MenuItem>
                ))}
              </Select>
              {errors.tipo_cita && <Typography color="error" variant="caption">{errors.tipo_cita}</Typography>}
            </FormControl>
            <TextField
              fullWidth
              label="Fecha de Cita"
              name="fecha_cita"
              type="date"
              value={formData.fecha_cita}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.fecha_cita}
              helperText={errors.fecha_cita}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Hora de Cita"
              name="hora_cita"
              type="time"
              value={formData.hora_cita}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.hora_cita}
              helperText={errors.hora_cita}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Motivo de la Cita"
              name="motivo_cita"
              multiline
              minRows={2}
              value={formData.motivo_cita}
              onChange={handleChange}
              error={!!errors.motivo_cita}
              helperText={errors.motivo_cita}
              sx={{ mb: 2 }}
            />
          </Box>
        );
      case 2:
        const pacienteObj = pacientes.find(p => p.id === Number(formData.paciente));
        const medicoObj = medicos.find(m => m.id === Number(formData.medico));
        const usuarioObj = usuarios.find(u => u.id === Number(formData.usuario));
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Resumen de la Cita</Typography>
            <Typography><strong>Paciente:</strong> {pacienteObj ? `${pacienteObj.nombre} - ${pacienteObj.identidad}` : ''}</Typography>
            <Typography><strong>Médico:</strong> {medicoObj ? `${medicoObj.nombre} - ${medicoObj.especialidad}` : ''}</Typography>
            <Typography><strong>Usuario:</strong> {usuarioObj ? `${usuarioObj.nombre} (${usuarioObj.rol})` : ''}</Typography>
            <Typography><strong>Tipo de Cita:</strong> {formData.tipo_cita}</Typography>
            <Typography><strong>Fecha:</strong> {formData.fecha_cita}</Typography>
            <Typography><strong>Hora:</strong> {formData.hora_cita}</Typography>
            <Typography><strong>Motivo:</strong> {formData.motivo_cita}</Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ bgcolor: '#f8f8f8', minHeight: '100vh', py: 4 }}>
      <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', p: { xs: 2, md: 4 }, borderRadius: 4, boxShadow: 6 }}>
        <Typography variant="h4" align="center" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
          Agendar Nueva Cita
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label, idx) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <form onSubmit={handleSubmit}>
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              sx={{ minWidth: 120 }}
            >
              Anterior
            </Button>
            {activeStep < 2 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                sx={{ minWidth: 120, boxShadow: 2 }}
              >
                Siguiente
              </Button>
            )}
            {activeStep === 2 && (
              <Button
                variant="contained"
                color="success"
                onClick={handleConfirm}
                sx={{ minWidth: 120, boxShadow: 2 }}
              >
                Confirmar y Reservar
              </Button>
            )}
          </Box>
        </form>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ScheduleAppointment;
