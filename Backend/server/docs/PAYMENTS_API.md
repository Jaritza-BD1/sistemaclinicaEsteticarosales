# API de Pagos - Sistema de Citas Médicas

Este documento describe las APIs implementadas para el manejo de pagos de citas médicas.

## 📋 **Resumen**

Se han implementado servicios y endpoints para gestionar el flujo de pagos de citas médicas:

1. **Obtener citas pendientes de pago** - Lista todas las citas en estado `PENDIENTE_PAGO`
2. **Procesar pago de cita** - Marca una cita como pagada y cambia su estado a `FINALIZADA`
3. **Estadísticas de pagos** - Información agregada sobre pagos pendientes

## 🔧 **Arquitectura Implementada**

### **appointmentService.js** - Servicio de Negocio
- `getPendingPayments(filters)` - Obtiene citas pendientes con filtros opcionales
- `payAppointment(appointmentId, usuarioCajaId, datosPago)` - Procesa pago con transacción

### **paymentController.js** - Controlador REST
- `getPendingPayments()` - Endpoint GET para listar pagos pendientes
- `payAppointment()` - Endpoint POST para procesar pago
- `getPaymentStats()` - Endpoint GET para estadísticas

### **paymentRoutes.js** - Rutas Express
- `/api/payments/pending` - GET
- `/api/payments/stats` - GET
- `/api/payments/:appointmentId/pay` - POST

## 📚 **Endpoints Detallados**

### **1. Obtener Pagos Pendientes**
```http
GET /api/payments/pending
```

**Parámetros de consulta (opcionales):**
- `fecha` - Filtrar por fecha específica (YYYY-MM-DD)
- `medicoId` - Filtrar por ID de médico

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "atr_id_cita": 123,
      "atr_fecha_cita": "2025-11-21",
      "atr_hora_cita": "10:00:00",
      "atr_motivo_cita": "Consulta general",
      "Patient": {
        "atr_id_paciente": 456,
        "atr_nombre": "Juan",
        "atr_apellido": "Pérez"
      },
      "Doctor": {
        "atr_id_medico": 789,
        "atr_nombre": "María",
        "atr_apellido": "González"
      }
    }
  ]
}
```

### **2. Procesar Pago de Cita**
```http
POST /api/payments/:appointmentId/pay
```

**Parámetros de URL:**
- `appointmentId` - ID de la cita a pagar

**Cuerpo de la solicitud (opcional):**
```json
{
  "formaPago": "EFECTIVO",
  "referencia": "REC-001",
  "observacion": "Pago en efectivo"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "message": "Pago procesado exitosamente",
    "cita": {
      "atr_id_cita": 123,
      "atr_id_estado": 5,
      "atr_fecha_cita": "2025-11-21",
      "atr_hora_cita": "10:00:00"
    }
  }
}
```

### **3. Estadísticas de Pagos**
```http
GET /api/payments/stats
```

**Parámetros de consulta (opcionales):**
- `fecha` - Filtrar por fecha específica
- `medicoId` - Filtrar por médico

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "totalPendientes": 5,
    "porMedico": {
      "789": {
        "nombre": "María González",
        "cantidad": 3,
        "citas": [
          {
            "id": 123,
            "fecha": "2025-11-21",
            "hora": "10:00:00",
            "paciente": "Juan Pérez"
          }
        ]
      }
    },
    "porFecha": {
      "2025-11-21": {
        "cantidad": 2,
        "citas": [
          {
            "id": 123,
            "hora": "10:00:00",
            "medico": "María González",
            "paciente": "Juan Pérez"
          }
        ]
      }
    },
    "totalMontoEstimado": 0
  }
}
```

## 🔒 **Seguridad y Autenticación**

- **Todas las rutas requieren autenticación JWT**
- **Usuario de caja**: Se obtiene automáticamente del token JWT (`req.user.atr_id_usuario`)
- **Registro en bitácora**: Cada operación se registra automáticamente

## 📊 **Flujo de Estados**

```
PROGRAMADA → CONFIRMADA → EN_CONSULTA → PENDIENTE_PAGO → FINALIZADA
                                                            ↑
                                                    Pago procesado
```

## 🗄️ **Registro en Bitácora**

Cada operación registra automáticamente en `tbl_ms_bitacora`:

### **Pago de Cita**
- **Acción**: `PAGAR_CITA`
- **Descripción**: `"Cita {appointmentId} marcada como FINALIZADA (Pago Caja)"`
- **Usuario**: ID del usuario de caja
- **Objeto**: ID de la cita

## ⚠️ **Manejo de Errores**

### **Cita no encontrada (404)**
```json
{
  "success": false,
  "message": "Cita no encontrada"
}
```

### **Cita no está en estado PENDIENTE_PAGO (400)**
```json
{
  "success": false,
  "message": "La cita no está en estado PENDIENTE_PAGO"
}
```

### **Error interno (500)**
```json
{
  "success": false,
  "message": "Error al procesar el pago"
}
```

## 🔧 **Uso Programático**

### **JavaScript/Node.js**
```javascript
// Obtener pagos pendientes
const response = await fetch('/api/payments/pending?medicoId=789', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();

// Procesar pago
const paymentResponse = await fetch(`/api/payments/123/pay`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    formaPago: 'TARJETA',
    referencia: 'TXN-001',
    observacion: 'Pago con tarjeta de crédito'
  })
});
```

## 📈 **Funcionalidades Futuras**

- **Cálculo automático de montos** basado en tipo de cita
- **Múltiples formas de pago** por cita
- **Historial de pagos** detallado
- **Reportes financieros** por período
- **Integración con sistemas contables**

## 🎯 **Beneficios**

1. **Transaccional**: Todas las operaciones usan transacciones de base de datos
2. **Auditable**: Registro completo en bitácora de todas las operaciones
3. **Seguro**: Autenticación requerida y validación de estados
4. **Escalable**: Fácil de extender con nuevas funcionalidades
5. **Consistente**: Respuestas estandarizadas y manejo de errores uniforme