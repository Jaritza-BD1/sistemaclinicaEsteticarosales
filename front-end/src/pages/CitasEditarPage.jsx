import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Snackbar
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import AppointmentForm from '../Components/appointments/AppointmentForm';
import useAppointments from '../hooks/useAppointments';

const CitasEditarPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAppointmentById, updateAppointment } = useAppointments();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const loadAppointment = async () => {
      try {
        const data = await getAppointmentById(id);
        // Transform API data to form format
        const transformedData = {
          motivo: data.atr_motivo_cita || '',
          fecha: data.atr_fecha_cita ? new Date(data.atr_fecha_cita) : null,
          hora: data.atr_hora_cita ? (() => {
            const [hours, minutes] = data.atr_hora_cita.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return date;
          })() : null,
          estado: data.atr_id_estado || 'PROGRAMADA',
          pacienteId: data.atr_id_paciente || '',
          medicoId: data.atr_id_medico || '',
          tipoCitaId: data.atr_id_tipo_cita || '',
          duracion: data.atr_duracion || 60,
        };
        setAppointment(transformedData);
      } catch (err) {
        setError('Error al cargar la cita');
      } finally {
        setLoading(false);
      }
    };

    loadAppointment();
  }, [id, getAppointmentById]);

  const handleSubmit = async (formData) => {
    try {
      await updateAppointment(id, formData);
      setSnackbar({ open: true, message: 'Cita actualizada correctamente', severity: 'success' });
      // Navigate back to list after a short delay
      setTimeout(() => {
        navigate('/citas');
      }, 1500);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al actualizar la cita', severity: 'error' });
    }
  };

  const handleCancel = () => {
    navigate('/citas');
  };

  if (loading) {
    return (
      <Container sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
            sx={{ mr: 2 }}
          >
            Volver
          </Button>
          <Typography variant="h5" component="h1">
            Editar Cita
          </Typography>
        </Box>

        {appointment && (
          <AppointmentForm
            initialData={appointment}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitButtonText="Actualizar Cita"
            title="Editar Cita"
          />
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default CitasEditarPage;