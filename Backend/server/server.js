// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');

// Configuraciones
const config = require('./Config/environment');
const corsOptions = require('./Config/cors');
// Iniciar jobs (backup automático y limpieza de tokens)
try {
  require('./Jobs/cleanupTokens.job');
} catch (e) {
  // ignore if job not available
}
try {
  require('./Jobs/backup.job');
} catch (e) {
  // ignore if job not available
}
// Job para limpiar archivos huérfanos en uploads/
try {
  require('./Jobs/cleanupUploads.job');
} catch (e) {
  // ignore if job not available
}
try {
  require('./Jobs/cleanupTrash.job');
} catch (e) {
  // ignore if job not available
}
// Job para recordatorios automáticos
try {
  require('./Jobs/reminder.job');
} catch (e) {
  // ignore if job not available
}
// Job para envío de recordatorios pendientes
try {
  require('./Jobs/followup.job');
} catch (e) {
  // ignore if job not available
}



// Middlewares
const { errorHandler } = require('./Middlewares/errorHandler');
const ResponseService = require('./services/responseService');
const calendarMiddleware = require('./Middlewares/calendarMiddleware');

// Servicios
const logger = require('./utils/logger');

// Base de datos
const sequelize = require('./Config/db');

// Rutas
const authRoutes = require('./Routers/authRoute');
const adminRoutes = require('./Routers/adminRoutes');
const appointmentRoutes = require('./Routers/appointmentRoutes');
const doctorRoutes = require('./Routers/doctorRoutes');
const especialidadRoutes = require('./Routers/especialidadRoutes');
const medicoHorarioRoutes = require('./Routers/medicoHorarioRoutes');
const generoRoutes = require('./Routers/generoRoutes');
const patientRoutes = require('./Routers/patientRoutes');
const treatmentRoutes = require('./Routers/treatmentRoutes');
const examRoutes = require('./Routers/examRoutes');
const productRoutes = require('./Routers/productRoutes');
const rolRoutes = require('./Routers/rolRoutes');
const permisoRoutes = require('./Routers/permisoRoutes');
const objetoRoutes = require('./Routers/objetoRoutes');
const backupRoutes = require('./Routers/backupRoutes');
const schedulerRoutes = require('./Routers/schedulerRoutes');
const maintenanceRoutes = require('./Routers/maintenanceRoutes');
const consultationRoutes = require('./Routers/consultationRoutes');
const prescriptionRoutes = require('./Routers/prescriptionRoutes');
const paymentRoutes = require('./Routers/paymentRoutes');

const app = express();

const path = require('path');

// If the app is behind a proxy (nginx, load balancer, platform), enable trust proxy
// so middleware like express-rate-limit can rely on X-Forwarded-* headers correctly.
// For local development this is safe; set to 1 to trust the first proxy hop.
app.set('trust proxy', 1);

// 1. CONFIGURACIÓN CORS ======================================================
app.use(cors(corsOptions));

// 2. CONFIGURACIÓN DE SEGURIDAD =============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", config.frontend.url]
    }
  },
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));

// 3. MIDDLEWARE ADICIONAL ===================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Configuración para manejar headers grandes
app.use((req, res, next) => {
  // Aumentar el límite de listeners
  req.setMaxListeners(0);
  res.setMaxListeners(0);
  
  // Configurar límites de headers
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 10 * 1024 * 1024) {
    return res.status(413).json({
      success: false,
      message: 'Payload demasiado grande'
    });
  }
  
  next();
});

// 4. RATE LIMITING ==========================================================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos
  message: { 
    success: false, 
    message: 'Demasiadas peticiones, inténtalo más tarde.' 
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 5. RUTAS ==================================================================
app.use(calendarMiddleware); // Inyecta los servicios antes de las rutas
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/especialidades', especialidadRoutes);
app.use('/api/medico-horarios', medicoHorarioRoutes);
app.use('/api/generos', generoRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/products', productRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/permisos', permisoRoutes);
app.use('/api/objetos', objetoRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/backup', backupRoutes);
app.use('/api/admin/scheduler', schedulerRoutes);
// Rutas genéricas de mantenimiento (CRUD para modelos)
// IMPORTANT: mount the maintenanceRoutes before the generic /api/admin router
// so that requests to /api/admin/maintenance/* are handled by the maintenance
// router and not swallowed by the adminRoutes 404 fallback.
app.use('/api/admin/maintenance', maintenanceRoutes);

app.use('/api/admin', adminRoutes);

// Ruta de Bitacora
const bitacoraRoutes = require('./Routers/BitacoraRoutes');
app.use('/api', bitacoraRoutes);

// Servir archivos subidos (carpeta uploads/) de forma segura
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de parámetros
app.get('/api/params/:key', async (req, res) => {
  try {
    const Parametro = require('./Models/Parametro');
    const p = await Parametro.findOne({ 
      where: { atr_parametro: req.params.key }
    });
    
    if (!p) {
      return ResponseService.notFound(res, 'Parámetro no existe');
    }
    
    return ResponseService.success(res, { value: p.atr_valor });
  } catch (error) {
    logger.error('Error obteniendo parámetro', error);
    return ResponseService.internalError(res, 'Error interno');
  }
});

// 6. MANEJO DE ERRORES ======================================================
// 404 - Endpoint no encontrado
app.use((req, res) => {
  return ResponseService.notFound(res, 'Endpoint no encontrado');
});

// Manejador de errores global
app.use(errorHandler);

// 7. INICIO DEL SERVIDOR ====================================================
const PORT = config.port;

(async () => {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    logger.startup('✅ Base de datos conectada');
    
    if (process.env.NODE_ENV === 'development') {
      // await sequelize.sync({ force: false, alter: false });
      logger.startup('🔃 Sincronización de modelos omitida - solo lógica cargada');
      
      // Crear parámetro si no existe
      const Parametro = require('./Models/Parametro');
      const seed = await Parametro.findOne({ 
        where: { atr_parametro: 'ADMIN_INTENTOS_INVALIDOS' }
      });
      
      if (!seed) {
        await Parametro.create({
          atr_parametro: 'ADMIN_INTENTOS_INVALIDOS',
          atr_valor: '3',
          atr_descripcion: 'Máx. intentos inválidos'
        });
        logger.startup('🔧 Parámetro ADMIN_INTENTOS_INVALIDOS creado');
      }
    }
    
    const server = http.createServer({ maxHeaderSize: 16384 }, app);
    server.listen(PORT, () => {
      logger.startup(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      logger.startup(`📧 Frontend URL: ${config.frontend.url}`);
      logger.startup(`🔐 JWT Secret configurado: ${config.jwt.secret ? 'Sí' : 'No'}`);
    });
    
  } catch (error) {
    logger.error('❌ Error al iniciar servidor', error);
    process.exit(1);
  }
})();





