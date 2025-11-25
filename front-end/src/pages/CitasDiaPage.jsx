import React, { useEffect, useState } from 'react';
import { getTodayAppointments, checkInAppointment, rescheduleAppointment } from '../services/appointmentService';
import CitasDiaList from '../Components/appointments/CitasDiaList';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsContext';

const CitasDiaPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotifications();
  const [processingIds, setProcessingIds] = useState([]);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const resp = await getTodayAppointments();
      // resp may be: axios response (with .data), or normalized object.
      // Normalize common shapes to an array of appointments.
      let payload = resp;
      if (resp && resp.data) payload = resp.data;
      // payload might be { success, data } or { items, meta } or the array itself
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload.data)) list = payload.data;
      else if (Array.isArray(payload.items)) list = payload.items;
      else if (Array.isArray(payload.results)) list = payload.results; // defensive
      else list = [];
      setAppointments(list);
    } catch (err) {
      console.error('Error cargando citas del día:', err);
      notify({ message: err?.response?.data?.message || err?.message || 'Error cargando citas del día', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async (id) => {
    setProcessingIds(p => Array.from(new Set([...p, id])));
    try {
      await checkInAppointment(id);
      await loadData();
      notify({ message: 'Check-in realizado', severity: 'success' });
    } catch (err) {
      console.error('Error en check-in:', err);
      notify({ message: err?.response?.data?.message || err?.message || 'Error en check-in', severity: 'error' });
    } finally {
      setProcessingIds(p => p.filter(x => x !== id));
    }
  };

  const handleStartConsultation = async (id) => {
    // Navegar a la página de consulta (el cambio de estado se hace automáticamente en ConsultationPage)
    navigate(`/citas/consulta/${id}`);
  };

  const handleReschedule = async (id, payload) => {
    // If payload is provided (from AppointmentList modal), call API and refresh.
    if (payload) {
      setProcessingIds(p => Array.from(new Set([...p, id])));
      try {
        await rescheduleAppointment(id, payload);
        await loadData();
        notify({ message: 'Cita reprogramada', severity: 'success' });
      } catch (err) {
        console.error('Error reprogramando cita:', err);
        notify({ message: err?.response?.data?.message || err?.message || 'Error reprogramando cita', severity: 'error' });
      } finally {
        setProcessingIds(p => p.filter(x => x !== id));
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
      <CitasDiaList
        appointments={appointments}
        loading={loading}
        processingIds={processingIds}
        onCheckIn={handleCheckIn}
        onStartConsultation={handleStartConsultation}
        onReschedule={handleReschedule}
        onCancel={handleCancel}
      />
      {/* Notifications shown via NotificationsContext */}
    </div>
  );
};

export default CitasDiaPage;