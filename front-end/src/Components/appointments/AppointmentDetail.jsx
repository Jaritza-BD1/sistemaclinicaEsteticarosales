// File: src/components/appointments/AppointmentDetail.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAppointmentById } from '../../redux/appointments/appointmentsSelectors';
import { confirmApp } from '../../redux/appointments/appointmentsSlice';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Tabs,
  Tab,
  Divider,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { checkInAppointment } from '../../services/appointmentService';
import AppointmentReminders from './AppointmentReminders';

export default function AppointmentDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appt = useSelector(state => selectAppointmentById(state, id));
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [checkInLoading, setCheckInLoading] = useState(false);

  if (!appt) return <Typography sx={{ p: 4, textAlign: 'center' }}>Cargando...</Typography>;

  const handleConfirm = async () => {
    await dispatch(confirmApp(id)).unwrap();
    navigate('/citas');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const response = await checkInAppointment(id);
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Check-in registrado exitosamente',
          severity: 'success'
        });
        // Recargar la página para mostrar los cambios
        window.location.reload();
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Error en check-in',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error en check-in:', error);
      setSnackbar({
        open: true,
        message: 'Error al registrar check-in',
        severity: 'error'
      });
    } finally {
      setCheckInLoading(false);
    }
  };

  const canCheckIn = () => {
    if (!appt) return false;
    const validStatuses = ['CONFIRMADA', 'EN_CURSO'];
    return validStatuses.includes(appt.status) && !appt.atr_fecha_hora_checkin;
  };

  const canStartConsultation = () => {
    if (!appt) return false;
    const validStatuses = ['PROGRAMADA', 'CONFIRMADA'];
    return validStatuses.includes(appt.status);
  };

  const handleStartConsultation = () => {
    navigate(`/citas/consulta/${id}`);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', my: 4 }}>
      <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, color: 'primary.main', fontWeight: 700 }}>
          Detalle de la Cita #{id}
        </Typography>

        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="subtitle1"><strong>Paciente:</strong> {appt.patientName || 'N/A'}</Typography>
          <Typography variant="subtitle1"><strong>Médico:</strong> {appt.doctorName || 'N/A'}</Typography>
          <Typography variant="subtitle1"><strong>Fecha:</strong> {appt.date || 'N/A'}</Typography>
          <Typography variant="subtitle1"><strong>Hora:</strong> {appt.time || 'N/A'}</Typography>
          <Typography variant="subtitle1"><strong>Tipo de Cita:</strong> {appt.type || 'N/A'}</Typography>
          <Typography variant="subtitle1"><strong>Motivo:</strong> {appt.reason || 'N/A'}</Typography>
          <Typography variant="subtitle1"><strong>Estado:</strong> {appt.status || 'N/A'}</Typography>
          {appt.atr_fecha_hora_checkin && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="success" />
              <Typography variant="subtitle1">
                <strong>Check-in:</strong>{' '}
                {new Date(appt.atr_fecha_hora_checkin).toLocaleString('es-ES')}
              </Typography>
            </Box>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="appointment tabs">
            <Tab label="Acciones" />
            <Tab label="Recordatorios" />
          </Tabs>
        </Box>

        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Acciones Disponibles</Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleConfirm}
                >
                  Confirmar Cita
                </Button>
                {canCheckIn() && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleCheckIn}
                    disabled={checkInLoading}
                  >
                    {checkInLoading ? 'Registrando...' : 'Check-in Paciente'}
                  </Button>
                )}
                {canStartConsultation() && (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<ScheduleIcon />}
                    onClick={handleStartConsultation}
                  >
                    Iniciar Consulta
                  </Button>
                )}
                <Button
                  variant="outlined"
                  onClick={() => navigate('/citas')}
                >
                  Volver a Citas
                </Button>
              </Stack>

              {appt.atr_fecha_hora_checkin && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  El paciente realizó check-in el {new Date(appt.atr_fecha_hora_checkin).toLocaleString('es-ES')}
                </Alert>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <AppointmentReminders appointmentId={id} />
          )}
        </Box>
      </Paper>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
