// server.js
require('dotenv').config({ path: '.env' });
console.log('FRONTEND_URL en entry point:', process.env.FRONTEND_URL);

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Sequelize } = require('sequelize');
const xss = require('xss');
const nodemailer = require('nodemailer');

// Routers
const authRoutes = require('./Routers/authRoute');
const adminRoutes = require('./Routers/adminRoutes');

// Auth middlewares
const { authenticate, isAdmin } = require('./Middlewares/authMiddlewares');

// Models
const Parametro = require('./Models/Parametro');

const app = express();

// 1. CONFIGURACIÓN CORS DEFINITIVA ===========================================
const allowedOrigins = [
  'http://localhost:3000',  // Origen principal
  'http://localhost:5000',
  process.env.FRONTEND_URL
].filter(Boolean).map(origin => origin.replace(/\/$/, '')); // Normalizar URLs

// Configuración simplificada y efectiva
const corsOptions = {
  origin: 'http://localhost:3000',  // SOLO PERMITIR ESTE ORIGEN
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Aplicar CORS globalmente
app.use(cors(corsOptions));

// Middleware para manejo manual de encabezados (CRÍTICO)
app.use((req, res, next) => {
  // Configuración esencial de encabezados
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar solicitudes OPTIONS inmediatamente
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// 2. CONFIGURACIÓN DE SEGURIDAD ==============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", 'http://localhost:3000'] // Permitir conexiones al frontend
    }
  },
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));

// 3. MIDDLEWARE ADICIONAL ====================================================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Sanitizar XSS
app.use((req, res, next) => {
  ['body','query','params'].forEach(loc => {
    if (req[loc]) {
      for (const key of Object.keys(req[loc])) {
        if (typeof req[loc][key] === 'string') {
          req[loc][key] = xss(req[loc][key]);
        }
      }
    }
  });
  next();
});

// 4. SERVICIOS ===============================================================
// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Base de datos
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
    define: { timestamps: true, paranoid: true, underscored: true }
  }
);

// Rate limiter para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiadas peticiones, inténtalo más tarde.' }
});

// 5. RUTAS ===================================================================
// Montar routers
app.use('/api/auth', authLimiter, authRoutes);

// Ruta única para parámetros (eliminé el duplicado)
app.get('/api/params/:key', async (req, res) => {
  try {
    const p = await Parametro.findOne({ 
      where: { atr_parametro: req.params.key }
    });
    
    if (!p) return res.status(404).json({ error: 'Parámetro no existe' });
    
    res.json({ value: p.atr_valor });
    
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Rutas administrativas
app.use('/api/admin', authenticate, isAdmin, adminRoutes);

// 6. MANEJO DE ERRORES =======================================================
// 404 - Endpoint no encontrado
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint no encontrado' });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, {
    endpoint: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip
  });
  
  // Asegurar encabezados CORS incluso en errores
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// 7. INICIO DEL SERVIDOR =====================================================
const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB conectada');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
      console.log('🔃 Modelos sincronizados');
      
      // Crear parámetro si no existe
      const seed = await Parametro.findOne({ 
        where: { atr_parametro: 'ADMIN_INTENTOS_INVALIDOS' }
      });
      
      if (!seed) {
        await Parametro.create({
          atr_parametro: 'ADMIN_INTENTOS_INVALIDOS',
          atr_valor: '3',
          atr_descripcion: 'Máx. intentos inválidos'
        });
        console.log('🔧 Parámetro ADMIN_INTENTOS_INVALIDOS creado');
      }
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
    
  } catch (e) {
    console.error('❌ Error al iniciar servidor:', e);
    process.exit(1);
  }
})();





