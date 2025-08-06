// backend/server/utils/logger.js
const winston = require('winston');
const path = require('path');
const { createLogger, format, transports } = winston; // Desestructuración para claridad

// Configuración de formatos
const logFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  format.errors({ stack: true }), // Para incluir el stack trace en los errores
  format.json()
);

const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    // Asegurarse de que meta no esté vacío antes de stringificar
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info', // Nivel de log desde variable de entorno o 'info' por defecto
  format: logFormat,
  defaultMeta: { service: 'clinica-estetica-api' }, // Meta data por defecto para todos los logs
  transports: [
    // Archivo de errores (solo logs de nivel 'error' o superior)
    new transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5 // Rotación de logs, mantiene los últimos 5 archivos
    }),
    // Archivo combinado (todos los logs según el 'level' configurado)
    new transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Agregar transporte de consola solo en entornos que no sean de producción
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: consoleFormat,
    level: process.env.LOG_LEVEL || 'debug' // En desarrollo, mostrar logs más detallados en consola
  }));
}

// Métodos de conveniencia para un logging más semántico
logger.startup = (message) => logger.info(`🚀 ${message}`);
logger.db = (message) => logger.info(`🗄️ ${message}`);
logger.auth = (message, meta = {}) => logger.info(`🔐 ${message}`, meta);
logger.api = (message, meta = {}) => logger.info(`🌐 ${message}`, meta);
logger.error = (message, error = null) => {
  if (error instanceof Error) { // Asegurarse de que 'error' sea una instancia de Error
    logger.log('error', message, {
      error: error.message,
      stack: error.stack,
      // Puedes agregar más propiedades del objeto Error si es necesario
      ...Object.keys(error).reduce((acc, key) => {
        if (key !== 'message' && key !== 'stack') { // Evitar duplicar message y stack
          acc[key] = error[key];
        }
        return acc;
      }, {})
    });
  } else if (error) { // Si 'error' es un objeto pero no una instancia de Error
    logger.log('error', message, { error });
  } else { // Si no hay objeto de error
    logger.log('error', message);
  }
};

module.exports = logger; // Exporta la instancia de logger configurada