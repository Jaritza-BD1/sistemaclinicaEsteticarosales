// utils/logger.js
const { createLogger, format, transports } = require('winston');
const path = require('path');

// Crea el directorio de logs si no existe
require('fs').mkdirSync('logs', { recursive: true });

module.exports = createLogger({
  level: 'debug', // Nivel mínimo de logs a registrar
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // Incluye stack traces en errores
    format.splat(), // Para interpolación de strings
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    // Consola (formato legible con colores)
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] [${level}] ${message}`;
        })
      ),
    }),
    // Archivo para logs de Sequelize (formato JSON estructurado)
    new transports.File({
      filename: path.join('logs', 'sequelize.log'),
      format: format.combine(
        format.json() // Guarda logs en formato JSON
      ),
      level: 'debug', // Nivel para archivos
    }),
    // Archivo general para errores
    new transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
    }),
  ],
});