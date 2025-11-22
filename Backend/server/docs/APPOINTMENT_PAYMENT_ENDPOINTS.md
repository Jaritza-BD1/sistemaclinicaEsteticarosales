# Endpoints de Pagos en Appointment Controller

Se han agregado dos nuevos endpoints al controlador de citas para manejar pagos pendientes:

## 📋 **Endpoints Agregados**

### **1. Obtener Citas Pendientes de Pago**
```http
GET /api/appointments/pending-payment
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
POST /api/appointments/:id/pay
```

**Parámetros de URL:**
- `id` - ID de la cita a pagar

**Cuerpo de la solicitud (opcional):**
```json
{
  "formaPago": "EFECTIVO",
  "referencia": "REC-001",
  "observacion": "Pago en caja principal"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Cita marcada como FINALIZADA",
  "data": {
    "atr_id_cita": 123,
    "atr_id_estado": 5,
    "atr_fecha_cita": "2025-11-21",
    "atr_hora_cita": "10:00:00"
  }
}
```

## 🔧 **Implementación Técnica**

### **Controlador (`appointmentController.js`)**

#### **`getPendingPaymentAppointments`**
- Delega la lógica al servicio `appointmentService.getPendingPayments()`
- Maneja parámetros de consulta opcionales
- Retorna respuesta JSON estandarizada

#### **`payAppointment`**
- Extrae `usuarioCajaId` del token JWT (`req.user.atr_id_usuario`)
- Procesa datos opcionales de pago del body
- Delega al servicio `appointmentService.payAppointment()`
- Retorna cita actualizada con mensaje de éxito

### **Rutas (`appointmentRoutes.js`)**

#### **Configuración de rutas:**
```javascript
// Obtener citas pendientes de pago
router.get(
  '/pending-payment',
  appointmentCtrl.getPendingPaymentAppointments
);

// Procesar pago de cita
router.post(
  '/:id/pay',
  [param('id').isInt()],
  validateRequest,
  appointmentCtrl.payAppointment
);
```

#### **Middlewares aplicados:**
- `authenticate` - Autenticación JWT requerida
- `authorizeAppointment` - Autorización de citas
- `limiter` - Rate limiting (30 requests/minuto)
- `validateRequest` - Validación de parámetros

## 🔒 **Seguridad**

- **Autenticación requerida** en todas las rutas
- **Usuario de caja** obtenido automáticamente del JWT
- **Validación de parámetros** con express-validator
- **Rate limiting** para prevenir abuso
- **Autorización** específica para operaciones de citas

## 📊 **Flujo de Trabajo**

```
1. Médico finaliza consulta → Estado: PENDIENTE_PAGO
2. Caja consulta GET /api/appointments/pending-payment
3. Caja procesa pago POST /api/appointments/:id/pay
4. Sistema cambia estado → FINALIZADA
5. Bitácora registra la operación
```

## ⚠️ **Manejo de Errores**

Los errores se manejan a través del middleware global de errores (`next(error)`):

- **Errores de validación** → 400 Bad Request
- **Cita no encontrada** → 404 Not Found
- **Estado inválido** → 400 Bad Request
- **Errores de BD** → 500 Internal Server Error

## 🔗 **Relación con Otros Endpoints**

### **Endpoints relacionados:**
- `GET /api/payments/pending` - Versión alternativa en paymentController
- `GET /api/payments/stats` - Estadísticas de pagos
- `POST /api/consultations/:id/finish` - Finaliza consulta (pone en PENDIENTE_PAGO)

### **Consistencia:**
Ambos controladores (`appointmentController` y `paymentController`) usan el mismo servicio subyacente (`appointmentService`), garantizando consistencia en la lógica de negocio.

## 📈 **Beneficios**

1. **Integración natural** - Los pagos son parte del flujo de citas
2. **API consistente** - Sigue el patrón REST del resto del controlador
3. **Reutilización** - Usa servicios existentes para mantener consistencia
4. **Seguridad** - Hereda toda la seguridad del controlador de citas
5. **Mantenibilidad** - Código organizado y fácil de mantener

## 🎯 **Uso Recomendado**

- **Frontend de caja** debería usar estos endpoints para gestionar pagos
- **Aplicaciones móviles** pueden integrar estos endpoints directamente
- **Sistemas externos** pueden consumir la API de pagos a través de citas

Los endpoints están listos para producción y siguen las mejores prácticas de la API existente. 🚀