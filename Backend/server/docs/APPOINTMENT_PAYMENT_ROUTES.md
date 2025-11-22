# Rutas de Pagos en Appointment Routes

Se han actualizado las rutas de pagos en `appointmentRoutes.js` para usar una estructura más simple y clara:

## 📋 **Rutas Actualizadas**

### **1. Obtener Citas Pendientes de Pago**
```javascript
router.get(
  '/pending-payment',
  authMiddleware,
  // opcional: middleware de rol caja:
  // cajaMiddleware,
  appointmentCtrl.getPendingPaymentAppointments
);
```

**Endpoint:** `GET /api/appointments/pending-payment`

### **2. Procesar Pago de Cita**
```javascript
router.post(
  '/:id/pay',
  authMiddleware,
  // opcional: cajaMiddleware,
  appointmentCtrl.payAppointment
);
```

**Endpoint:** `POST /api/appointments/:id/pay`

## 🔧 **Middlewares Implementados**

### **`authMiddleware`**
- **Archivo:** `../Middlewares/authMiddlewares.js`
- **Función:** Autenticación JWT requerida
- **Responsabilidad:** Verificar token válido y extraer usuario
- **Usuario disponible:** `req.user.atr_id_usuario`

### **`adminMiddleware` (Opcional)**
- **Archivo:** `../Middlewares/adminMiddleware.js`
- **Función:** Verificación de rol administrador
- **Condición:** `req.user.role === 'admin'`
- **Uso:** Para operaciones que requieren permisos elevados

### **`cajaMiddleware` (Comentado)**
- **Estado:** No implementado aún
- **Propósito:** Middleware específico para usuarios de caja
- **Uso futuro:** Para diferenciar roles de caja vs admin

## 🛡️ **Seguridad Implementada**

### **Autenticación:**
```javascript
// En authMiddlewares.js
const authenticate = async (req, res, next) => {
  // 1. Extraer token JWT
  // 2. Verificar token válido
  // 3. Buscar usuario en BD
  // 4. Adjuntar usuario a req.user
  // 5. Continuar o retornar error 401
};
```

### **Autorización:**
- **Base:** Todas las rutas requieren autenticación JWT
- **Rol opcional:** `adminMiddleware` puede activarse para ADMIN
- **Rol futuro:** `cajaMiddleware` preparado para usuarios de caja

## 📊 **Comparación con Versión Anterior**

### **Antes (Compleja):**
```javascript
router.post(
  '/:id/pay',
  [param('id').isInt()],        // Validación express-validator
  validateRequest,              // Middleware de validación
  appointmentCtrl.payAppointment
);
```

### **Ahora (Simple):**
```javascript
router.post(
  '/:id/pay',
  authMiddleware,               // Solo autenticación
  appointmentCtrl.payAppointment
);
```

## 🎯 **Beneficios de la Nueva Estructura**

### **1. Simplicidad:**
- **Menos middlewares** por ruta
- **Código más legible** y mantenible
- **Dependencias reducidas**

### **2. Flexibilidad:**
- **Middlewares opcionales** comentados para futuro
- **Fácil activación** de roles específicos
- **Extensible** para nuevos requisitos

### **3. Consistencia:**
- **Patrón claro** para rutas críticas
- **Separación de responsabilidades**
- **Manejo de errores** centralizado

## 🔄 **Flujo de Autenticación**

```
Cliente → JWT Token → authMiddleware → Verificación → req.user → Controlador
```

## 📝 **Uso de Roles**

### **Rol ADMIN (Opcional):**
```javascript
// Para activar verificación de admin:
router.post(
  '/:id/pay',
  authMiddleware,
  adminMiddleware,  // ← Descomentar para requerir ADMIN
  appointmentCtrl.payAppointment
);
```

### **Rol CAJA (Futuro):**
```javascript
// Cuando se implemente cajaMiddleware:
// router.post(
//   '/:id/pay',
//   authMiddleware,
//   cajaMiddleware,  // ← Para usuarios de caja
//   appointmentCtrl.payAppointment
// );
```

## 🚀 **Implementación Lista**

Las rutas están configuradas y listas para:

- ✅ **Autenticación JWT** funcional
- ✅ **Controladores** implementados
- ✅ **Servicios** disponibles
- ✅ **Bitácora** automática
- ✅ **Transacciones** de BD
- ⏳ **Roles específicos** preparados para futuro

## 📚 **Documentación Relacionada**

- `APPOINTMENT_PAYMENT_ENDPOINTS.md` - Endpoints detallados
- `PAYMENTS_API.md` - API completa de pagos
- `REDUX_CONSULTATIONS.md` - Estado frontend

La estructura de rutas es ahora más simple, segura y preparada para escalar con roles específicos según las necesidades del negocio. 🎉