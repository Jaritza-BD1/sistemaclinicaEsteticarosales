// utils/logger.js
const winston = require('winston');
const path = require('path');
const { createLogger, format, transports } = require('winston');

// File: server/utils/logger.js
module.exports = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/app.log' })
  ]
});

// Configuración de formatos
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'clinica-estetica-api' },
  transports: [
    // Archivo de errores
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Archivo combinado
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Agregar transporte de consola en desarrollo
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Métodos de conveniencia
logger.startup = (message) => logger.info(`🚀 ${message}`);
logger.db = (message) => logger.info(`🗄️ ${message}`);
logger.auth = (message, meta = {}) => logger.info(`🔐 ${message}`, meta);
logger.api = (message, meta = {}) => logger.info(`🌐 ${message}`, meta);
logger.error = (message, error = null) => {
  if (error) {
    logger.log('error', message, {
      error: error.message,
      stack: error.stack,
      ...error
    });
  } else {
    logger.log('error', message);
  }
};

module.exports = logger;