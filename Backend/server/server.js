// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Configuraciones
const config = require('./config/environment');
const corsOptions = require('./config/cors');

// Middlewares
const errorHandler = require('./middlewares/errorHandler');
const ResponseService = require('./services/responseService');

// Servicios
const logger = require('./utils/logger');

// Base de datos
const sequelize = require('./config/database');

// Rutas
const authRoutes = require('./Routers/authRoute');
const adminRoutes = require('./Routers/adminRoutes');

const app = express();

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
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

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
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de Bitacora
const bitacoraRoutes = require('./Routers/BitacoraRoutes');
app.use('/api', bitacoraRoutes);

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
      await sequelize.sync();
      logger.startup('🔃 Modelos sincronizados');
      
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
    
    app.listen(PORT, () => {
      logger.startup(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      logger.startup(`📧 Frontend URL: ${config.frontend.url}`);
      logger.startup(`🔐 JWT Secret configurado: ${config.jwt.secret ? 'Sí' : 'No'}`);
    });
    
  } catch (error) {
    logger.error('❌ Error al iniciar servidor', error);
    process.exit(1);
  }
})();





