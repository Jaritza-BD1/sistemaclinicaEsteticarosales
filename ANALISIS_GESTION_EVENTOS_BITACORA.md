# Análisis de Gestión de Eventos de la Bitácora - Sistema Clínica Estética Rosales

## 📋 Resumen Ejecutivo

Este análisis evalúa si la función de eventos de la bitácora cumple con los **requerimientos de gestión de eventos** especificados:

1. ✅ **Control del Evento de los botones de pantalla** - Parcialmente implementado
2. ❌ **Control del Evento entre pantallas** - No implementado
3. ✅ **Control del Evento de los permisos de usuario** - Implementado
4. ❌ **Control del Evento del acceso del usuario** - Parcialmente implementado

## 🎯 Requerimientos vs Implementación Actual

### 1. ✅ **Control del Evento de los botones de pantalla**

**Requerimiento:**
> "No se puede salir de una pantalla si esta en proceso la creacion o edicion de un nuevo registro, se debe advertir al usuario y dejar que tome la decision."

**Estado Actual: ✅ PARCIALMENTE IMPLEMENTADO**

#### ✅ **Lo que SÍ está implementado:**

**Frontend - Formularios con validación:**
```javascript
// Ejemplo en PatientForm.jsx
const handleUpdate = async () => {
  try {
    await axios.put(`${API_URL}/${selected.atr_id_paciente}`, selected);
    setSnackbar({ open: true, msg: 'Paciente actualizado', severity: 'success' });
    setEditOpen(false);
    loadPacientes();
  } catch (err) {
    setSnackbar({ open: true, msg: 'Error al actualizar', severity: 'error' });
  }
};
```

**Backend - Validaciones en controladores:**
```javascript
// Ejemplo en authControllers.js
if (status === 'PENDIENTE_VERIFICACION') {
  return res.status(403).json({ error: 'Verifica tu email primero' });
}
```

#### ❌ **Lo que FALTA implementar:**

1. **Prevención de navegación durante procesos activos**
2. **Confirmación antes de salir de formularios en edición**
3. **Bloqueo de botones durante operaciones**

### 2. ❌ **Control del Evento entre pantallas**

**Requerimiento:**
> "No se puede permitir que se pueden abrir mas de una pantalla dentro del sistema a menos que el proceso lo requiera, esto es controlado por el mismo proceso."

**Estado Actual: ❌ NO IMPLEMENTADO**

#### ❌ **Problemas identificados:**

1. **Múltiples ventanas/pestañas permitidas**
2. **No hay control de sesiones activas por pantalla**
3. **Falta middleware de control de navegación**

#### 🔧 **Solución propuesta:**

```javascript
// Middleware para control de pantallas activas
const screenControlMiddleware = (req, res, next) => {
  const userId = req.user?.id;
  const currentScreen = req.path;
  
  // Verificar si el usuario ya tiene otra pantalla activa
  const activeScreens = getActiveScreens(userId);
  
  if (activeScreens.length > 0 && !isAllowedMultiple(activeScreens, currentScreen)) {
    return res.status(409).json({
      error: 'Ya tienes una pantalla activa. Cierra la ventana actual antes de continuar.'
    });
  }
  
  // Registrar pantalla activa
  registerActiveScreen(userId, currentScreen);
  next();
};
```

### 3. ✅ **Control del Evento de los permisos de usuario**

**Requerimiento:**
> "No se puede permitir que un usuario ingrese a una pantalla que no tenga acceso o realizar una accion que no este configurada en el ROL del mismo."

**Estado Actual: ✅ IMPLEMENTADO**

#### ✅ **Lo que SÍ está implementado:**

**Backend - Middleware de autenticación:**
```javascript
// authMiddleware.js
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseService.unauthorized(res, 'Token de acceso requerido');
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return ResponseService.unauthorized(res, 'Usuario no encontrado');
    }

    if (user.atr_estado_usuario !== 'ACTIVO') {
      return ResponseService.forbidden(res, 'Cuenta no activa');
    }

    req.user = user;
    next();
  } catch (error) {
    // Manejo de errores...
  }
};
```

**Frontend - Protección de rutas:**
```javascript
// ProtectedRoute.jsx
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole !== null && (!user || user.atr_id_rol !== requiredRole)) {
    return <Navigate to="/not-found" replace />;
  }

  return children;
};
```

**Middleware de autorización específica:**
```javascript
// appointmentMiddleware.js
function authorizeAppointment(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const userRole = req.user.atr_id_rol;
  
  if (userRole !== 1 && userRole !== 2) {
    return res.status(403).json({ 
      error: 'No autorizado para acceder a appointments',
      requiredRole: 'Usuario o Administrador'
    });
  }

  next();
}
```

### 4. ❌ **Control del Evento del acceso del usuario**

**Requerimiento:**
> "No se permite que el usuario tenga mas de una sesion activa en el sistema para evitar se tiene que manejar un estado intermedio de "Loggin" que no permita el ingreso del mismo usuario al sistema 2 veces."

**Estado Actual: ❌ PARCIALMENTE IMPLEMENTADO**

#### ✅ **Lo que SÍ está implementado:**

**Control de estado de usuario:**
```javascript
// authControllers.js
if (status === 'PENDIENTE_VERIFICACION') {
  return res.status(403).json({ error: 'Verifica tu email primero' });
}
if (status === 'PENDIENTE_APROBACION') {
  return res.status(403).json({ error: 'Cuenta pendiente de aprobación' });
}
if (status === 'BLOQUEADO') {
  return res.status(403).json({
    error: `Cuenta bloqueada hasta ${user.atr_reset_expiry.toLocaleTimeString()}`
  });
}
```

**Actualización de última conexión:**
```javascript
// authMiddlewares.js
await User.update(
  { atr_fecha_ultima_conexion: new Date() },
  { where: { atr_id_usuario: user.atr_id_usuario } }
);
```

#### ❌ **Lo que FALTA implementar:**

1. **Control de sesiones múltiples simultáneas**
2. **Estado "LOGGING" intermedio**
3. **Invalidación de tokens previos**

## 🔧 Implementación de la Bitácora de Eventos

### ✅ **Funcionalidades Implementadas:**

#### **1. Registro de Eventos**
```javascript
// BitacoraController.js
const registrarEventoBitacora = async (atr_accion, atr_descripcion, atr_id_usuario, atr_id_objetos, ip_origen = null) => {
    try {
        const idRegistro = await bitacoraService.registrarEvento({
            atr_id_usuario,
            atr_id_objetos,
            atr_accion,
            atr_descripcion,
            ip_origen
        });
        return { success: true, data: { idRegistro }, message: 'Evento de bitácora registrado exitosamente.' };
    } catch (error) {
        return { success: false, message: `Error interno del servidor al registrar evento de bitácora: ${error.message}` };
    }
};
```

#### **2. Middleware de Bitácora**
```javascript
// bitacoraMiddleware.js
const registrarEvento = async (req, res, next) => {
    try {
        const usuarioId = req.user?.id || null;
        const objetoId = obtenerIdObjeto(req);

        if (!usuarioId) {
            logError('Usuario no autenticado en registro de bitácora');
            return next();
        }

        const [result] = await sequelize.query(
            `CALL REGISTRAR_BITACORA(:fecha, :usuarioId, :objetoId, :accion, :descripcion, :ipOrigen)`,
            {
                replacements: {
                    fecha: new Date(),
                    usuarioId,
                    objetoId: objetoId || null,
                    accion: req.method,
                    descripcion: `Acción en ${req.path}`,
                    ipOrigen: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
                }
            }
        );

        next();
    } catch (error) {
        logError('Error en middleware de bitácora', error);
        next();
    }
};
```

#### **3. Servicio de Bitácora**
```javascript
// bitacoraService.js
const bitacoraService = {
  async registrarEvento({ atr_id_usuario, atr_id_objetos, atr_accion, atr_descripcion, ip_origen = null }) {
    try {
      const bitacora = await Bitacora.create({
        atr_fecha: new Date(),
        atr_id_usuario,
        atr_id_objetos,
        atr_accion,
        atr_descripcion,
        ip_origen
      });
      return bitacora.atr_id_bitacora;
    } catch (error) {
      throw new Error('No se pudo registrar el evento de auditoría');
    }
  },

  async obtenerEventos(filtros = {}) {
    // Implementación de consulta con filtros
  }
};
```

## 🚨 Problemas Identificados

### 1. **Falta Control de Pantallas Activas**
- No hay validación de pantallas múltiples
- No hay prevención de navegación durante procesos
- No hay confirmación antes de salir de formularios

### 2. **Falta Control de Sesiones Múltiples**
- No hay invalidación de tokens previos
- No hay estado "LOGGING" intermedio
- No hay control de sesiones simultáneas

### 3. **Falta Integración Completa**
- La bitácora no registra todos los eventos de control
- No hay correlación entre eventos de UI y bitácora
- No hay validación de permisos en tiempo real

## 🔧 Soluciones Propuestas

### 1. **Implementar Control de Pantallas Activas**

```javascript
// Nuevo middleware: screenControlMiddleware.js
const screenControlMiddleware = (req, res, next) => {
  const userId = req.user?.id;
  const currentScreen = req.path;
  
  // Verificar pantallas activas
  const activeScreens = getActiveScreens(userId);
  
  if (activeScreens.length > 0 && !isAllowedMultiple(activeScreens, currentScreen)) {
    return res.status(409).json({
      error: 'Ya tienes una pantalla activa. Cierra la ventana actual antes de continuar.'
    });
  }
  
  // Registrar pantalla activa
  registerActiveScreen(userId, currentScreen);
  next();
};
```

### 2. **Implementar Control de Sesiones Múltiples**

```javascript
// Nuevo servicio: sessionControlService.js
const sessionControlService = {
  async checkActiveSession(userId) {
    const activeSession = await Session.findOne({
      where: { userId, status: 'ACTIVE' }
    });
    
    if (activeSession) {
      return {
        hasActiveSession: true,
        sessionId: activeSession.id,
        lastActivity: activeSession.lastActivity
      };
    }
    
    return { hasActiveSession: false };
  },

  async createSession(userId, token) {
    // Invalidar sesiones previas
    await Session.update(
      { status: 'INACTIVE' },
      { where: { userId, status: 'ACTIVE' } }
    );
    
    // Crear nueva sesión
    return await Session.create({
      userId,
      token,
      status: 'ACTIVE',
      lastActivity: new Date()
    });
  }
};
```

### 3. **Mejorar Integración con Bitácora**

```javascript
// Mejorar bitacoraMiddleware.js
const registrarEvento = async (req, res, next) => {
    try {
        const usuarioId = req.user?.id || null;
        const objetoId = obtenerIdObjeto(req);
        const eventType = getEventType(req);

        // Registrar evento de control
        await bitacoraService.registrarEvento({
            atr_id_usuario: usuarioId,
            atr_id_objetos: objetoId,
            atr_accion: eventType,
            atr_descripcion: `Control de evento: ${eventType} en ${req.path}`,
            ip_origen: req.ip
        });

        next();
    } catch (error) {
        logError('Error en middleware de bitácora', error);
        next();
    }
};
```

## 📊 Evaluación Final

### ✅ **Cumple Completamente:**
- Control de permisos de usuario
- Registro de eventos en bitácora
- Autenticación y autorización básica

### ⚠️ **Cumple Parcialmente:**
- Control de botones de pantalla (solo validaciones básicas)
- Control de acceso de usuario (solo estado de cuenta)

### ❌ **No Cumple:**
- Control de eventos entre pantallas
- Control de sesiones múltiples simultáneas
- Estado "LOGGING" intermedio

## 🎯 Recomendaciones

### 1. **Prioridad Alta**
- Implementar control de pantallas activas
- Implementar control de sesiones múltiples
- Mejorar integración con bitácora

### 2. **Prioridad Media**
- Agregar confirmaciones antes de salir de formularios
- Implementar estado "LOGGING" intermedio
- Mejorar logging de eventos de control

### 3. **Prioridad Baja**
- Optimizar consultas de bitácora
- Agregar reportes de eventos
- Implementar notificaciones en tiempo real

## ✅ Conclusión

La función de eventos de la bitácora **cumple parcialmente** con los requerimientos de gestión de eventos:

- ✅ **Control de permisos**: Implementado correctamente
- ⚠️ **Control de botones**: Implementado básicamente
- ❌ **Control entre pantallas**: No implementado
- ⚠️ **Control de sesiones múltiples**: Implementado parcialmente

Se requiere implementar las soluciones propuestas para cumplir completamente con todos los requerimientos especificados. 