# Backend - Clínica Estética Rosales

## 🚀 Nueva Arquitectura Implementada

Este backend ha sido completamente refactorizado siguiendo las mejores prácticas de desarrollo y una arquitectura escalable.

## 📁 Estructura del Proyecto

```
Backend/server/
├── config/                 # Configuraciones centralizadas
│   ├── environment.js      # Variables de entorno por ambiente
│   ├── cors.js            # Configuración CORS
│   └── database.js        # Configuración de base de datos
├── controllers/           # Controladores (lógica de presentación)
│   ├── authController.js
│   ├── adminController.js
│   └── twoFactorController.js
├── middlewares/           # Middlewares personalizados
│   ├── authMiddleware.js
│   ├── validation.js
│   └── errorHandler.js
├── models/               # Modelos de Sequelize
│   ├── User.js
│   ├── BackupCode.js
│   ├── PasswordHistory.js
│   ├── Parametro.js
│   └── Bitacora.js
├── routes/               # Definición de rutas
│   ├── authRoutes.js
│   └── adminRoutes.js
├── services/             # Lógica de negocio
│   ├── authService.js
│   ├── twoFactorService.js
│   └── responseService.js
├── utils/                # Utilidades
│   ├── logger.js
│   ├── mailer.js
│   └── tokenHelper.js
├── logs/                 # Archivos de log
├── .env.example          # Variables de entorno de ejemplo
└── server.js             # Punto de entrada
```

## 🛠️ Instalación

### 1. Instalar dependencias
```bash
cd Backend/server
npm install
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar las variables según tu configuración
nano .env
```

### 3. Variables de entorno requeridas
```env
# Configuración del servidor
NODE_ENV=development
PORT=5000

# Base de datos
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=clinica_estetica
MYSQL_USER=root
MYSQL_PASSWORD=tu_password

# JWT
JWT_SECRET=tu-super-secreto-jwt-aqui

# Frontend
FRONTEND_URL=http://localhost:3000

# Email
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-de-aplicacion

# Seguridad
BCRYPT_SALT_ROUNDS=10
MAX_LOGIN_ATTEMPTS=3

# Logging
LOG_LEVEL=info
```

### 4. Configurar base de datos
```sql
-- Crear la base de datos
CREATE DATABASE clinica_estetica CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Ejecutar el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🔧 Mejoras Implementadas

### ✅ Problemas Corregidos
1. **Rutas faltantes de 2FA** - Agregadas todas las rutas que el frontend necesita
2. **Configuración CORS** - Mejorada y flexible para múltiples entornos
3. **Inconsistencia de campos** - Estandarizados los nombres de campos
4. **Manejo de errores** - Centralizado y consistente
5. **Validaciones** - Centralizadas y reutilizables

### ✅ Arquitectura Mejorada
1. **Separación de responsabilidades** - Servicios, controladores, rutas separados
2. **Configuración centralizada** - Variables de entorno organizadas
3. **Logging estructurado** - Winston con diferentes niveles
4. **Respuestas estandarizadas** - Formato consistente para todas las APIs
5. **Middleware modular** - Reutilizable y mantenible

### ✅ Escalabilidad
1. **Configuración por entorno** - Desarrollo, staging, producción
2. **Rate limiting** - Protección contra ataques
3. **Validación robusta** - Express-validator con reglas personalizadas
4. **Manejo de errores global** - Captura todos los errores no manejados
5. **Logging detallado** - Para debugging y monitoreo

## 📡 Endpoints Disponibles

### Autenticación (`/api/auth`)
- `POST /register` - Registro de usuarios
- `GET /verify-email` - Verificación de email
- `POST /login` - Inicio de sesión
- `POST /change-password` - Cambio de contraseña
- `POST /forgot-password` - Recuperación de contraseña
- `POST /reset-password` - Restablecimiento de contraseña
- `GET /profile` - Perfil de usuario
- `GET /verify-token` - Verificación de token JWT

### 2FA (`/api/auth/2fa`)
- `GET /setup` - Configurar 2FA
- `POST /verify` - Verificar token 2FA
- `DELETE /disable` - Deshabilitar 2FA
- `GET /new-backup-codes` - Generar nuevos códigos de respaldo
- `POST /verify-login` - Verificar 2FA durante login
- `POST /resend-code` - Reenviar código 2FA
- `POST /verify-email-code` - Verificar código por email

### Administración (`/api/admin`)
- `GET /users` - Listar usuarios
- `POST /users` - Crear usuario
- `PATCH /users/:id/block` - Bloquear usuario
- `PUT /users/:id/reset-password` - Resetear contraseña
- `GET /logs` - Listar logs
- `DELETE /logs/:id` - Eliminar log
- `GET /pending-users` - Usuarios pendientes
- `POST /approve-user/:id` - Aprobar usuario

## 🔍 Logging

El sistema de logging está configurado con Winston y guarda logs en:
- `logs/error.log` - Solo errores
- `logs/combined.log` - Todos los logs

### Niveles de log disponibles:
- `logger.startup()` - Mensajes de inicio
- `logger.db()` - Operaciones de base de datos
- `logger.auth()` - Operaciones de autenticación
- `logger.api()` - Llamadas a la API
- `logger.error()` - Errores

## 🚨 Manejo de Errores

Todos los errores son capturados y formateados consistentemente:

```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [
    {
      "field": "campo",
      "message": "mensaje de error",
      "value": "valor inválido"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔐 Seguridad

- **Rate limiting** en endpoints de autenticación
- **Validación de entrada** con express-validator
- **Sanitización XSS** automática
- **Headers de seguridad** con Helmet
- **CORS configurado** para múltiples entornos
- **JWT con expiración** configurable
- **Contraseñas hasheadas** con bcrypt

## 📊 Monitoreo

El sistema incluye:
- Logs estructurados para análisis
- Métricas de rate limiting
- Trazabilidad de errores
- Información de contexto en logs

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
NODE_ENV=production npm start
```

### Docker (opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 Notas de Migración

Si estás migrando desde la versión anterior:

1. **Actualizar variables de entorno** según el nuevo formato
2. **Verificar rutas del frontend** - algunas pueden haber cambiado
3. **Revisar logs** para identificar problemas de migración
4. **Probar endpoints críticos** antes del despliegue completo

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles. 

# Bitácora API

## Endpoints

### 1. Registrar evento en la bitácora
- **POST** `/bitacora/registrar`
- **Body:**
  - `accion` (string, requerido): Acción realizada (ej: 'Ingreso', 'Update', 'Delete', etc.)
  - `descripcion` (string, requerido): Descripción del evento
  - `idUsuario` (int, requerido): ID del usuario que realiza la acción
  - `idObjeto` (int, requerido): ID del objeto/pantalla
- **Ejemplo:**
```json
{
  "accion": "Ingreso",
  "descripcion": "Inicio de sesión exitoso",
  "idUsuario": 1,
  "idObjeto": 2
}
```
- **Respuesta exitosa:**
```json
{
  "success": true,
  "data": { "idRegistro": 123 },
  "message": "Evento de bitácora registrado exitosamente."
}
```

### 2. Consultar eventos de la bitácora
- **GET** `/bitacora/consultar`
- **Query params (opcionales):**
  - `atr_id_usuario` (int): Filtrar por usuario
  - `atr_id_objetos` (int): Filtrar por objeto
  - `atr_accion` (string): Filtrar por acción
  - `fechaInicio` (YYYY-MM-DD): Fecha inicial
  - `fechaFin` (YYYY-MM-DD): Fecha final
  - `limit` (int): Límite de resultados (default: 100)
  - `offset` (int): Offset para paginación
- **Ejemplo:**
```
GET /bitacora/consultar?atr_id_usuario=1&fechaInicio=2024-01-01&fechaFin=2024-01-31
```
- **Respuesta exitosa:**
```json
{
  "success": true,
  "data": [
    {
      "atr_id_bitacora": 123,
      "atr_fecha": "2024-01-01",
      "atr_id_usuario": 1,
      "atr_id_objetos": 2,
      "atr_accion": "Ingreso",
      "atr_descripcion": "Inicio de sesión exitoso",
      "ip_origen": "127.0.0.1"
    }
  ],
  "message": "Consulta de bitácora realizada exitosamente."
}
```

### 3. Consultar estadísticas de la bitácora
- **GET** `/bitacora/estadisticas`
- **Query params (opcionales):**
  - `fechaInicio` (YYYY-MM-DD): Fecha inicial
  - `fechaFin` (YYYY-MM-DD): Fecha final
- **Ejemplo:**
```
GET /bitacora/estadisticas?fechaInicio=2024-01-01&fechaFin=2024-01-31
```
- **Respuesta exitosa:**
```json
{
  "success": true,
  "data": [
    {
      "atr_id_usuario": 1,
      "total_eventos": 10,
      "ingresos": 5,
      "actualizaciones": 3,
      "eliminaciones": 2
    }
  ],
  "message": "Consulta de estadísticas realizada exitosamente."
}
```

---

- Todas las rutas requieren autenticación (Bearer token).
- Los errores de validación y de servidor se devuelven en formato `{ success: false, message: ... }`. 