const cron = require('node-cron');
const Token = require('../Models/tokenmodel');
const logger = require('../Config/logger'); // Si tienes un logger configurado

// Ejecutar todos los días a las 3:00 AM
const cleanupJob = cron.schedule(
  '0 3 * * *',  // 3:00 AM
  async () => {
    try {
      console.log('🔍 Iniciando limpieza de tokens expirados...');
      const count = await Token.cleanupExpiredTokens();
      
      // Usa logger si lo tienes configurado, si no, console.log
      if (logger) {
        logger.info(`✅ Se eliminaron ${count} tokens expirados`);
      } else {
        console.log(`✅ Se eliminaron ${count} tokens expirados`);
      }
    } catch (error) {
      const errorMsg = '❌ Error al limpiar tokens expirados';
      if (logger) {
        logger.error(`${errorMsg}: ${error.message}`, { error });
      } else {
        console.error(errorMsg, error);
      }
    }
  },
  {
    scheduled: false, // No iniciar automáticamente
    timezone: "America/Honduras" // Ajusta según tu zona horaria
  }
);

module.exports = cleanupJob;