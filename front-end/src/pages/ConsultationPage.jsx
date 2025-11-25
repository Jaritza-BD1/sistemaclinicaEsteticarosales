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
  Alert
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
import { useNotifications } from '../context/NotificationsContext';

const ConsultationPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify } = useNotifications();

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

  // Use the new convenience selector hooks
  const consultation = useConsultationFromAppointment(appointmentId);
  const exams = useExamsHook(consultation?.atr_id_consulta);
  const prescriptions = usePrescHook(consultation?.atr_id_consulta);
  const treatments = useTreatHook(consultation?.atr_id_consulta);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      clearAllErrors();

      const appointmentRes = await api.get(`/appointments/${appointmentId}`);
      let appointmentData = appointmentRes.data.data;

      // Si la cita no está en EN_CONSULTA, intentamos cambiarla
      if (appointmentData.atr_id_estado !== APPOINTMENT_STATUS.EN_CONSULTA) {
        try {
          await updateAppointmentStatus(appointmentId, APPOINTMENT_STATUS.EN_CONSULTA);
          const updatedAppointmentRes = await api.get(`/appointments/${appointmentId}`);
          appointmentData = updatedAppointmentRes.data.data;
        } catch (statusError) {
          console.error('Error cambiando estado de cita:', statusError);
          notify({ message: statusError?.response?.data?.message || statusError?.message || 'No se pudo cambiar el estado de la cita', severity: 'error' });
        }
      }

      setAppointment(appointmentData);

      await fetchByAppointment(appointmentId);

    } catch (err) {
      console.error('Error cargando datos:', err);
      const msg = err?.customMessage || err?.response?.data?.error || err?.response?.data?.message || err.message || 'Error cargando datos de la cita';
      notify({ message: msg, severity: 'error' });
    }
  };

  const handleConsultationSaved = () => {
    if (consultation?.atr_id_consulta) fetchByAppointment(appointmentId);
    notify({ message: 'Consulta guardada exitosamente', severity: 'success' });
  };

  const handleFinishConsultation = async () => {
    if (!consultation) {
      notify({ message: 'Debe guardar la consulta primero', severity: 'error' });
      return;
    }

    try {
      setFinishing(true);
      await finish(consultation.atr_id_consulta, {});
      notify({ message: 'Consulta finalizada, cita en estado PENDIENTE_PAGO', severity: 'success' });
      setTimeout(() => navigate('/citas'), 2000);
    } catch (err) {
      console.error('Error finalizando consulta:', err);
      notify({ message: 'Error finalizando la consulta', severity: 'error' });
    } finally {
      setFinishing(false);
    }
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
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>Consulta Médica</Typography>

      {errors.fetch && <Alert severity="error" sx={{ mb: 2 }}>{errors.fetch}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ConsultationHeader appointment={appointment} consultation={consultation} />
        </Grid>

        <Grid item xs={12} md={4}>
          <PatientHistoryPanel patientId={appointment.atr_id_paciente} />
        </Grid>

        <Grid item xs={12} md={8}>
          <ConsultationForm
            appointmentId={appointmentId}
            appointment={appointment}
            consultation={consultation}
            onConsultationSaved={handleConsultationSaved}
          />

          {consultation && <ExamsSection consultationId={consultation.atr_id_consulta} />}
          {consultation && <PrescriptionSection consultationId={consultation.atr_id_consulta} />}
          {consultation && <TreatmentPlanSection consultationId={consultation.atr_id_consulta} />}

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

      {/* Notifications handled by NotificationsContext */}
    </Container>
  );
};

export default ConsultationPage;