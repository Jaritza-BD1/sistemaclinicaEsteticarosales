import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import AppointmentReminders from '../Components/appointments/AppointmentReminders';
import { fetchAppointments } from '../services/appointmentService';

const RecordatorioPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReminders, setShowReminders] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetchAppointments();
      if (response.data.success) {
        setAppointments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReminders = () => {
    if (selectedAppointmentId) {
      setShowReminders(true);
    }
  };

  const handleBackToSelection = () => {
    setShowReminders(false);
    setSelectedAppointmentId('');
  };

  const selectedAppointment = appointments.find(app => app.atr_id_cita === parseInt(selectedAppointmentId));

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Gestión de Recordatorios</Typography>

      {!showReminders ? (
        <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Seleccionar Cita
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Cita</InputLabel>
                <Select
                  value={selectedAppointmentId}
                  label="Cita"
                  onChange={(e) => setSelectedAppointmentId(e.target.value)}
                >
                  {appointments.map((appointment) => (
                    <MenuItem key={appointment.atr_id_cita} value={appointment.atr_id_cita}>
                      #{appointment.atr_id_cita} - {appointment.Patient?.atr_nombres} {appointment.Patient?.atr_apellidos} - {appointment.atr_fecha_cita} {appointment.atr_hora_cita}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleViewReminders}
                disabled={!selectedAppointmentId}
                fullWidth
              >
                Ver Recordatorios
              </Button>
            </>
          )}
        </Paper>
      ) : (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" onClick={handleBackToSelection}>
              ← Volver a selección
            </Button>
          </Box>

          {selectedAppointment && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Cita #{selectedAppointment.atr_id_cita}</strong><br />
              Paciente: {selectedAppointment.Patient?.atr_nombres} {selectedAppointment.Patient?.atr_apellidos}<br />
              Fecha: {selectedAppointment.atr_fecha_cita} {selectedAppointment.atr_hora_cita}
            </Alert>
          )}

          <AppointmentReminders appointmentId={selectedAppointmentId} />
        </Paper>
      )}
    </Box>
  );
};

export default RecordatorioPage;
