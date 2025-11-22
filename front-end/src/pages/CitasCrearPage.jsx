import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentForm from '../Components/appointments/AppointmentForm';

const CitasCrearPage = () => {
  const navigate = useNavigate();
  const handleSuccess = () => {
    // Volver al listado de citas tras crear
    navigate('/citas');
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Registrar Cita</h2>
      <AppointmentForm initialData={{}} onSuccess={handleSuccess} />
    </div>
  );
};

export default CitasCrearPage;
