const cron = require('node-cron');
const Token = require('./models/tokenmodel');

// Programar para ejecutarse todos los días a medianoche
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Ejecutando limpieza de tokens expirados...');
    const count = await Token.cleanupExpiredTokens();
    console.log(`Se eliminaron ${count} tokens expirados`);
  } catch (error) {
    console.error('Error al limpiar tokens expirados:', error);
  }
}, {
  timezone: "America/Honduras" // Ajusta según tu zona horaria
});