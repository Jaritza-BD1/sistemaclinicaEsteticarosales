import React, { useEffect, useState } from 'react';
import { getTodayAppointments, checkInAppointment } from '../services/appointmentService';
import AppointmentList from '../Components/appointments/AppointmentList';
import { useNavigate } from 'react-router-dom';

const CitasDiaPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
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
    await checkInAppointment(id);
    await loadData();
  };

  const handleStartConsultation = async (id) => {
    // Navegar a la página de consulta (el cambio de estado se hace automáticamente en ConsultationPage)
    navigate(`/consulta/${id}`);
  };

  const handleReschedule = (id) => {
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
    </div>
  );
};

export default CitasDiaPage;