const config = require('../Config/environment');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      config.frontend.url,
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.STAGING_FRONTEND_URL,
      process.env.PRODUCTION_FRONTEND_URL
    ].filter(Boolean);
    
    // Permitir requests sin origin (como aplicaciones móviles)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 horas
};

module.exports = corsOptions; 