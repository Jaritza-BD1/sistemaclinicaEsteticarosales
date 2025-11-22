# Sistema de Pagos - Redux Integration

## Descripción General

El sistema de pagos ha sido integrado completamente con Redux Toolkit para proporcionar state management centralizado para operaciones de pago de citas médicas.

## Estado del Store

El slice `appointments` ahora incluye campos específicos para pagos:

```javascript
{
  // ... campos existentes
  pendingPayments: [], // Array de citas pendientes de pago
  paymentStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  paymentError: null, // Mensaje de error específico para pagos
}
```

## Thunks Disponibles

### `loadPendingPayments(params = {})`
Carga las citas que están en estado "PENDIENTE_PAGO".

**Parámetros:**
- `params` (opcional): Objeto con filtros adicionales

**Uso:**
```javascript
dispatch(loadPendingPayments({ medicoId: 1, fechaDesde: '2024-01-01' }));
```

### `payAppointmentThunk({ appointmentId, paymentData = {} })`
Procesa el pago de una cita específica.

**Parámetros:**
- `appointmentId`: ID de la cita a pagar
- `paymentData`: Objeto con datos del pago (método, monto, notas, etc.)

**Uso:**
```javascript
dispatch(payAppointmentThunk({
  appointmentId: 123,
  paymentData: {
    paymentMethod: 'cash',
    amount: 150.00,
    notes: 'Pago en efectivo'
  }
}));
```

## Hook Personalizado

Se proporciona el hook `usePayments` para facilitar el uso en componentes:

```javascript
import { usePayments } from '../../redux/hooks/usePayments';

const MyComponent = () => {
  const {
    pendingPayments,
    isLoading,
    isSuccess,
    isError,
    error,
    fetchPendingPayments,
    payAppointment,
    clearError,
    clearPayments
  } = usePayments();

  // Uso en el componente
  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const handlePayment = (appointmentId) => {
    payAppointment(appointmentId, { paymentMethod: 'card', amount: 100 });
  };

  // Renderizado condicional basado en el estado
  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error: {error}</div>;

  return (
    <div>
      {pendingPayments.map(appointment => (
        <div key={appointment.id}>
          <p>{appointment.title}</p>
          <button onClick={() => handlePayment(appointment.id)}>
            Pagar
          </button>
        </div>
      ))}
    </div>
  );
};
```

## Acciones del Reducer

### `clearPaymentError()`
Limpia el mensaje de error de pagos.

### `clearPendingPayments()`
Limpia la lista de pagos pendientes.

## Flujo de Estado

### Cargar Pagos Pendientes
1. `loadPendingPayments.pending` → `paymentStatus = 'loading'`
2. `loadPendingPayments.fulfilled` → `pendingPayments = data`, `paymentStatus = 'succeeded'`
3. `loadPendingPayments.rejected` → `paymentStatus = 'failed'`, `paymentError = error`

### Procesar Pago
1. `payAppointmentThunk.pending` → `paymentStatus = 'loading'`
2. `payAppointmentThunk.fulfilled` → Remueve de `pendingPayments`, actualiza en `items`, `paymentStatus = 'succeeded'`
3. `payAppointmentThunk.rejected` → `paymentStatus = 'failed'`, `paymentError = error`

## Integración con Componentes

### Ejemplo Completo de Componente

```jsx
import React, { useEffect } from 'react';
import { usePayments } from '../../redux/hooks/usePayments';

const PaymentDashboard = () => {
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
  }, []);

  const handlePay = async (appointmentId) => {
    const paymentData = {
      paymentMethod: 'cash',
      amount: 200.00,
      reference: 'REF-001'
    };

    try {
      await payAppointment(appointmentId, paymentData);
      // Pago exitoso - el estado se actualiza automáticamente
    } catch (error) {
      // Error manejado por Redux
    }
  };

  return (
    <div className="payment-dashboard">
      <h1>Gestión de Pagos</h1>

      {isLoading && <p>Cargando pagos pendientes...</p>}

      {isError && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={clearError}>Reintentar</button>
        </div>
      )}

      <div className="payments-grid">
        {pendingPayments.map(appointment => (
          <div key={appointment.id} className="payment-card">
            <h3>{appointment.title}</h3>
            <p>Paciente: {appointment.patient?.atr_nombres}</p>
            <p>Fecha: {appointment.start.toLocaleDateString()}</p>
            <button onClick={() => handlePay(appointment.id)}>
              Procesar Pago
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentDashboard;
```

## Consideraciones de Seguridad

- Todas las operaciones de pago incluyen logging de auditoría automático
- Los errores se manejan de forma centralizada en el store
- El estado se mantiene consistente entre diferentes componentes
- Las transacciones se procesan de forma atómica en el backend

## Testing

Para testing de componentes que usan pagos:

```javascript
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../redux/store';
import PaymentComponent from './PaymentComponent';

test('renders payment component', () => {
  render(
    <Provider store={store}>
      <PaymentComponent />
    </Provider>
  );
});
```