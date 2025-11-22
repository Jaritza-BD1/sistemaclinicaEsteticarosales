const cron = require('node-cron');
const BackupService = require('../services/backupService');
const config = require('../Config/environment');
const logger = require('../utils/logger');

// Instanciar servicio
const backupService = new BackupService();

// Cron schedule desde env o por defecto a las 2:00 AM
const schedule = process.env.BACKUP_CRON || '0 2 * * *';

const job = cron.schedule(
  schedule,
  async () => {
    try {
      logger.info('🔁 Iniciando job automático de backup');

      await backupService.createBackup({
        server: config.database.host || process.env.MYSQL_HOST || 'localhost',
        database: config.database.name || process.env.MYSQL_DATABASE,
        user: config.database.user || process.env.MYSQL_USER,
        password: config.database.password || process.env.MYSQL_PASSWORD,
        backupPath: process.env.BACKUP_DIRECTORY || './backups',
        fileName: `autobackup-${config.database.name || process.env.MYSQL_DATABASE || 'database'}`
      });

      // Rotación / retención: eliminar backups antiguos según configuración
      const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS, 10) || 30;
      const maxFiles = parseInt(process.env.BACKUP_MAX_FILES, 10) || 0; // 0 = no limitar por archivos
      try {
        await backupService.cleanupOldBackups({ retentionDays, maxFiles });
        logger.info('🔄 Rotación de backups completada');
      } catch (e) {
        logger.error('Error ejecutando rotación de backups', e);
      }

      logger.info('✅ Job automático de backup completado');
    } catch (error) {
      logger.error('❌ Error en job automático de backup', error);
    }
  },
  {
    scheduled: true,
    timezone: process.env.BACKUP_TIMEZONE || 'America/Honduras'
  }
);

// Exportar el job en caso de que se quiera manipular desde otro módulo
module.exports = job;
