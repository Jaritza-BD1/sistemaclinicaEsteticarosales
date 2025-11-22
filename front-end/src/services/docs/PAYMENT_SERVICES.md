# Servicios de Pagos - Frontend

Se han agregado funciones al servicio de citas del frontend para manejar operaciones de pagos:

## 📋 **Funciones Agregadas**

### **1. Obtener Citas Pendientes de Pago**
```javascript
export const fetchPendingPayments = async (params = {}) => {
  const response = await api.get('/appointments/pending-payment', { params });
  return response.data.data;
};
```

### **2. Procesar Pago de Cita**
```javascript
export const payAppointment = async (appointmentId, payload = {}) => {
  const response = await api.post(`/appointments/${appointmentId}/pay`, payload);
  return response.data.data;
};
```

## 🔧 **Uso en Componentes**

### **Obtener pagos pendientes:**
```javascript
import { fetchPendingPayments } from '../services/appointmentService';

// Obtener todas las citas pendientes
const pendingPayments = await fetchPendingPayments();

// Con filtros
const filteredPayments = await fetchPendingPayments({
  fecha: '2025-11-21',
  medicoId: 123
});
```

### **Procesar un pago:**
```javascript
import { payAppointment } from '../services/appointmentService';

// Pago básico
const result = await payAppointment(123);

// Pago con datos adicionales
const resultWithData = await payAppointment(123, {
  formaPago: 'EFECTIVO',
  referencia: 'REC-001',
  observacion: 'Pago en caja principal'
});
```

## 📊 **Estructura de Datos**

### **Parámetros de consulta (fetchPendingPayments):**
```javascript
{
  fecha?: string,      // YYYY-MM-DD
  medicoId?: number    // ID del médico
}
```

### **Payload de pago (payAppointment):**
```javascript
{
  formaPago?: string,    // 'EFECTIVO', 'TARJETA', etc.
  referencia?: string,   // Número de recibo, transacción, etc.
  observacion?: string   // Notas adicionales
}
```

### **Respuesta exitosa:**
```javascript
// fetchPendingPayments retorna array de citas:
[
  {
    atr_id_cita: 123,
    atr_fecha_cita: "2025-11-21",
    atr_hora_cita: "10:00:00",
    atr_motivo_cita: "Consulta general",
    Patient: { atr_nombre: "Juan", atr_apellido: "Pérez" },
    Doctor: { atr_nombre: "María", atr_apellido: "González" }
  }
]

// payAppointment retorna la cita actualizada:
{
  atr_id_cita: 123,
  atr_id_estado: 5,  // FINALIZADA
  atr_fecha_cita: "2025-11-21",
  atr_hora_cita: "10:00:00"
}
```

## 🔄 **Integración con Redux**

### **Thunk para obtener pagos pendientes:**
```javascript
// En appointmentsSlice.js
export const fetchPendingPaymentsThunk = createAsyncThunk(
  'appointments/fetchPendingPayments',
  async (params, { rejectWithValue }) => {
    try {
      const data = await fetchPendingPayments(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
```

### **Thunk para procesar pago:**
```javascript
// En appointmentsSlice.js
export const payAppointmentThunk = createAsyncThunk(
  'appointments/payAppointment',
  async ({ appointmentId, payload }, { rejectWithValue }) => {
    try {
      const data = await payAppointment(appointmentId, payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
```

## 🎯 **Casos de Uso**

### **Componente de Caja:**
```javascript
const CajaPage = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingPayments();
  }, []);

  const loadPendingPayments = async () => {
    try {
      setLoading(true);
      const data = await fetchPendingPayments();
      setPendingPayments(data);
    } catch (error) {
      console.error('Error cargando pagos pendientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (appointmentId) => {
    try {
      await payAppointment(appointmentId, {
        formaPago: 'EFECTIVO',
        referencia: `REC-${Date.now()}`
      });
      // Recargar lista
      loadPendingPayments();
      // Mostrar mensaje de éxito
    } catch (error) {
      console.error('Error procesando pago:', error);
    }
  };

  return (
    <div>
      <h2>Citas Pendientes de Pago</h2>
      {pendingPayments.map(appointment => (
        <div key={appointment.atr_id_cita}>
          <p>{appointment.Patient.atr_nombre} - {appointment.atr_fecha_cita}</p>
          <button onClick={() => handlePayment(appointment.atr_id_cita)}>
            Marcar como Pagada
          </button>
        </div>
      ))}
    </div>
  );
};
```

## 🛡️ **Manejo de Errores**

### **Errores comunes:**
```javascript
try {
  await payAppointment(123);
} catch (error) {
  if (error.response?.status === 404) {
    // Cita no encontrada
  } else if (error.response?.status === 400) {
    // Cita no está en estado PENDIENTE_PAGO
  } else if (error.response?.status === 401) {
    // No autorizado
  } else {
    // Error general
  }
}
```

## 🔗 **Relación con Backend**

### **Endpoints correspondientes:**
- `GET /api/appointments/pending-payment` → `fetchPendingPayments()`
- `POST /api/appointments/:id/pay` → `payAppointment(id, payload)`

### **Middlewares aplicados:**
- **Autenticación JWT** requerida
- **Usuario de caja** extraído automáticamente
- **Transacción de BD** para garantizar consistencia
- **Registro en bitácora** automático

## 📈 **Beneficios**

1. **API consistente** con el resto del servicio de citas
2. **Manejo de errores** centralizado
3. **Fácil integración** con Redux
4. **Documentación clara** de parámetros y respuestas
5. **Reutilizable** en múltiples componentes

Los servicios de pagos están listos para ser usados en componentes de caja y gestión de pagos. 🚀