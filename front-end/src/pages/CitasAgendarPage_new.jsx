import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link as MUILink,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AppointmentForm from '../Components/appointments/AppointmentForm';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients, fetchDoctors, clearError } from '../redux/appointments/appointmentsSlice';

function CitasAgendarPage({ onClose, onSuccess }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector(state => state.appointments);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchDoctors());
  }, [dispatch]);

  const handleSuccess = () => {
    setShowSuccessNotification(true);
    setIsSubmitting(false);
    // Si se pasó un callback onSuccess, ejecútalo
    if (typeof onSuccess === 'function') {
      try { onSuccess(); } catch (e) { /* ignore */ }
    }
    // Si se pasó onClose (estamos en modal), ciérralo
    if (typeof onClose === 'function') {
      try { onClose(); } catch (e) { /* ignore */ }
    } else {
      // Redirigir a /citas después de 2 segundos
      setTimeout(() => {
        navigate('/citas');
      }, 2000);
    }
  };

  const handleError = (err) => {
    setIsSubmitting(false);
    console.error('Error al agendar cita:', err);
    // El error se maneja en el componente AppointmentForm
  };

  const handleSubmitStart = () => {
    setIsSubmitting(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MUILink component={RouterLink} to="/citas">Citas</MUILink>
        <Typography color="text.primary">Agendar</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Agendar Nueva Cita
      </Typography>

      {status === 'loading' && !isSubmitting ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <AppointmentForm
          onSuccess={handleSuccess}
          onError={handleError}
          onSubmitStart={handleSubmitStart}
        />
      )}

      {/* Notificación de éxito */}
      <Snackbar
        open={showSuccessNotification}
        autoHideDuration={3000}
        onClose={() => setShowSuccessNotification(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccessNotification(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          ¡Cita agendada exitosamente! Redirigiendo...
        </Alert>
      </Snackbar>

      {/* Notificación de error */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => dispatch(clearError())}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => dispatch(clearError())}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default CitasAgendarPage;