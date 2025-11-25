import React, { useEffect, useState } from 'react';
import { getTodayAppointments, checkInAppointment, rescheduleAppointment } from '../services/appointmentService';
import AppointmentList from '../Components/appointments/AppointmentList';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';

const CitasDiaPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await getTodayAppointments();
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async (id) => {
    try {
      await checkInAppointment(id);
      await loadData();
      setSnackbar({ open: true, message: 'Check-in realizado', severity: 'success' });
    } catch (err) {
      console.error('Error en check-in:', err);
      setSnackbar({ open: true, message: err?.response?.data?.message || err?.message || 'Error en check-in', severity: 'error' });
    }
  };

  const handleStartConsultation = async (id) => {
    // Navegar a la página de consulta (el cambio de estado se hace automáticamente en ConsultationPage)
    navigate(`/citas/consulta/${id}`);
  };

  const handleReschedule = async (id, payload) => {
    // If payload is provided (from AppointmentList modal), call API and refresh.
    if (payload) {
      try {
        await rescheduleAppointment(id, payload);
        await loadData();
      } catch (err) {
        console.error('Error reprogramando cita:', err);
      }
      return;
    }
    // Fallback: navigate to edit page
    navigate(`/citas/${id}/editar`);
  };

  const handleCancel = (id) => {
    // aquí luego conectarás con tu endpoint de cancelación
    navigate(`/citas/${id}/cancelar`);
  };

  return (
    <div>
      <h1>Citas del día</h1>
      <AppointmentList
        appointments={appointments}
        loading={loading}
        onCheckIn={handleCheckIn}
        onStartConsultation={handleStartConsultation}
        onReschedule={handleReschedule}
        onCancel={handleCancel}
      />
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={()=>setSnackbar(s=>({...s,open:false}))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={()=>setSnackbar(s=>({...s,open:false}))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CitasDiaPage;