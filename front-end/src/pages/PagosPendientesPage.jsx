// src/pages/PagosPendientesPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadPendingPayments, payAppointmentThunk } from '../redux/appointments/appointmentsSlice';
import AppointmentPendingPaymentList from '../Components/appointments/AppointmentPendingPaymentList';

const PagosPendientesPage = () => {
  const dispatch = useDispatch();
  const { pendingPayments, paymentStatus } = useSelector(
    (state) => state.appointments
  );

  useEffect(() => {
    dispatch(loadPendingPayments({}));
  }, [dispatch]);

  const handlePay = (appointmentId) => {
    // Mostrar modal de confirmación antes (opcional)
    dispatch(payAppointmentThunk({ appointmentId, payload: {} }));
  };

  return (
    <div>
      <h1>Pagos Pendientes (Caja)</h1>

      {paymentStatus === 'loading' && <p>Cargando...</p>}

      <AppointmentPendingPaymentList
        appointments={pendingPayments}
        onPay={handlePay}
      />
    </div>
  );
};

export default PagosPendientesPage;