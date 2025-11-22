// src/components/PaymentManagement/PendingPaymentsList.jsx
import React, { useEffect } from 'react';
import { usePayments } from '../../redux/hooks/usePayments';

const PendingPaymentsList = () => {
  const {
    pendingPayments,
    isLoading,
    isError,
    error,
    fetchPendingPayments,
    payAppointment,
    clearError
  } = usePayments();

  useEffect(() => {
    fetchPendingPayments();
  }, [fetchPendingPayments]);

  const handlePayAppointment = async (appointmentId) => {
    try {
      await payAppointment(appointmentId, {
        paymentMethod: 'cash', // o 'card', 'transfer', etc.
        amount: 100, // monto del pago
        notes: 'Pago realizado en caja'
      });
      // El estado se actualiza automáticamente en Redux
    } catch (error) {
      console.error('Error al procesar el pago:', error);
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando pagos pendientes...</div>;
  }

  if (isError) {
    return (
      <div className="error">
        <p>Error al cargar pagos pendientes: {error}</p>
        <button onClick={clearError}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="pending-payments">
      <h2>Citas Pendientes de Pago</h2>

      {pendingPayments.length === 0 ? (
        <p>No hay citas pendientes de pago.</p>
      ) : (
        <div className="payments-list">
          {pendingPayments.map((appointment) => (
            <div key={appointment.id} className="payment-item">
              <div className="appointment-info">
                <h3>{appointment.title}</h3>
                <p>Paciente: {appointment.patient?.atr_nombres} {appointment.patient?.atr_apellidos}</p>
                <p>Médico: {appointment.doctor?.atr_nombres} {appointment.doctor?.atr_apellidos}</p>
                <p>Fecha: {new Date(appointment.start).toLocaleDateString()}</p>
                <p>Hora: {new Date(appointment.start).toLocaleTimeString()}</p>
                <p>Estado: {appointment.statusName}</p>
              </div>

              <div className="payment-actions">
                <button
                  onClick={() => handlePayAppointment(appointment.id)}
                  className="pay-button"
                >
                  Procesar Pago
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingPaymentsList;