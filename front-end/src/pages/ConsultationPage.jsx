import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useConsultationFromAppointment,
  useConsultationExams as useExamsHook,
  useConsultationPrescriptions as usePrescHook,
  useConsultationTreatments as useTreatHook
} from '../hooks/useConsultations';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useAuth } from '../Components/context/AuthContext';
import api from '../services/api';
import { updateAppointmentStatus } from '../services/appointmentService';
import { APPOINTMENT_STATUS } from '../config/appointmentStatus';
import { useConsultations } from '../hooks/useConsultations';

// Import components
import ConsultationHeader from '../Components/ConsultationHeader';
import PatientHistoryPanel from '../Components/PatientHistoryPanel';
import ConsultationForm from '../Components/ConsultationForm';
import ExamsSection from '../Components/ExamsSection';
import PrescriptionSection from '../Components/PrescriptionSection';
import TreatmentPlanSection from '../Components/TreatmentPlanSection';

const ConsultationPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redux state
  const {
    selectConsultationFromAppointment,
    selectConsultationExams,
    selectConsultationPrescriptions,
    selectConsultationTreatments,
    loading,
    errors,
    fetchByAppointment,
    fetchConsultationExams,
    fetchConsultationPrescriptions,
    fetchConsultationTreatments,
    finish,
    clearAllErrors
  } = useConsultations();

  const [appointment, setAppointment] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get data from Redux
  // Use the new convenience selector hooks
  const consultation = useConsultationFromAppointment(appointmentId);
  const exams = useExamsHook(consultation?.atr_id_consulta);
  const prescriptions = usePrescHook(consultation?.atr_id_consulta);
  const treatments = useTreatHook(consultation?.atr_id_consulta);

  useEffect(() => {
    loadData();
  }, [appointmentId]);

  // When the consultation is available in the store, load related lists
  useEffect(() => {
    const loadRelated = async () => {
      if (consultation?.atr_id_consulta) {
        try {
          await Promise.all([
            fetchConsultationExams(consultation.atr_id_consulta),
            fetchConsultationPrescriptions(consultation.atr_id_consulta),
            fetchConsultationTreatments(consultation.atr_id_consulta)
          ]);
        } catch (e) {
          console.error('Error cargando datos relacionados de la consulta', e);
        }
      }
    };

    loadRelated();
  }, [consultation?.atr_id_consulta]);

  const loadData = async () => {
    try {
      // Clear any previous errors
      clearAllErrors();

      // Load appointment
      const appointmentRes = await api.get(`/appointments/${appointmentId}`);
      let appointment = appointmentRes.data.data;

      // Si la cita no está en EN_CONSULTA, cambiarla automáticamente
      if (appointment.atr_id_estado !== 3) { // 3 = EN_CONSULTA
        try {
          await updateAppointmentStatus(appointmentId, APPOINTMENT_STATUS.EN_CONSULTA);
          // Recargar la cita con el nuevo estado
          const updatedAppointmentRes = await api.get(`/appointments/${appointmentId}`);
          appointment = updatedAppointmentRes.data.data;
        } catch (statusError) {
          console.error('Error cambiando estado de cita:', statusError);
          setSnackbar({ open: true, message: statusError?.response?.data?.message || statusError?.message || 'No se pudo cambiar el estado de la cita', severity: 'error' });
          // Continuar con la cita original si falla el cambio de estado
        }
      }

      setAppointment(appointment);

      // Load consultation using Redux
      await fetchByAppointment(appointmentId);

      // If consultation exists, load related data
      if (consultation?.atr_id_consulta) {
        await Promise.all([
          fetchConsultationExams(consultation.atr_id_consulta),
          fetchConsultationPrescriptions(consultation.atr_id_consulta),
          fetchConsultationTreatments(consultation.atr_id_consulta)
        ]);
      }
    } catch (err) {
      console.error('Error cargando datos:', err);
      // Prefer backend-friendly messages when available
      const msg = err?.customMessage || err?.response?.data?.error || err?.response?.data?.message || err.message || 'Error cargando datos de la cita';
      setSnackbar({
        open: true,
        message: msg,
        severity: 'error'
      });
    }
  };

  const handleConsultationSaved = () => {
    // Reload consultation data after saving
    if (consultation?.atr_id_consulta) {
      fetchByAppointment(appointmentId);
    }
    setSnackbar({
      open: true,
      message: 'Consulta guardada exitosamente',
      severity: 'success'
    });
  };

  const handleFinishConsultation = async () => {
    if (!consultation) {
      setSnackbar({
        open: true,
        message: 'Debe guardar la consulta primero',
        severity: 'error'
      });
      return;
    }

    try {
      setFinishing(true);

      await finish(consultation.atr_id_consulta, {});

      setSnackbar({
        open: true,
        message: 'Consulta finalizada, cita en estado PENDIENTE_PAGO',
        severity: 'success'
      });

      // Redirect to appointments after a short delay
      setTimeout(() => {
        navigate('/citas');
      }, 2000);

    } catch (err) {
      console.error('Error finalizando consulta:', err);
      setSnackbar({
        open: true,
        message: 'Error finalizando la consulta',
        severity: 'error'
      });
    } finally {
      setFinishing(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading.fetch) return <Typography>Cargando...</Typography>;
  if (!appointment) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Cita no encontrada</Typography>
          <Typography sx={{ mb: 2 }} color="textSecondary">No fue posible cargar la cita. Verifique la conexión al backend o los permisos.</Typography>
          <Box display="flex" gap={2}>
            <Button variant="contained" onClick={loadData}>Reintentar</Button>
            <Button variant="outlined" onClick={() => navigate('/citas')}>Volver a Citas</Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Consulta Médica
      </Typography>

      {errors.fetch && <Alert severity="error" sx={{ mb: 2 }}>{errors.fetch}</Alert>}

      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <ConsultationHeader appointment={appointment} consultation={consultation} />
        </Grid>

        {/* Patient History */}
        <Grid item xs={12} md={4}>
          <PatientHistoryPanel patientId={appointment.atr_id_paciente} />
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Consultation Form */}
          <ConsultationForm
            appointmentId={appointmentId}
            appointment={appointment}
            consultation={consultation}
            onConsultationSaved={handleConsultationSaved}
          />

          {/* Exams Section */}
          {consultation && <ExamsSection consultationId={consultation.atr_id_consulta} />}

          {/* Prescription Section */}
          {consultation && <PrescriptionSection consultationId={consultation.atr_id_consulta} />}

          {/* Treatment Section */}
          {consultation && <TreatmentPlanSection consultationId={consultation.atr_id_consulta} />}

          {/* Finish Consultation Button */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<CheckCircleIcon />}
                onClick={handleFinishConsultation}
                disabled={finishing || !consultation || loading.finish}
                sx={{ px: 4, py: 1.5 }}
              >
                {finishing || loading.finish ? 'Finalizando...' : 'Finalizar Consulta'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConsultationPage;