const cron = require('node-cron');
const BackupService = require('./backupService');
const logger = require('../utils/logger');

class SchedulerService {
  constructor() {
    this.backupService = new BackupService();
    this.jobs = new Map();
    this.loadScheduledJobs();
  }

  // Cargar jobs programados desde la base de datos
  async loadScheduledJobs() {
    try {
      // Aquí cargarías los jobs guardados en la BD
      // Por ahora usamos configuración por defecto
      logger.info('Scheduler iniciado');
    } catch (error) {
      logger.error('Error cargando jobs programados:', error);
    }
  }

  // Crear un job automático de backup
  createBackupJob(jobConfig) {
    const {
      id,
      name,
      schedule, // formato cron: '0 2 * * *' (diario a las 2 AM)
      server,
      database,
      user,
      password,
      backupPath,
      retentionDays = 30
    } = jobConfig;

    try {
      // Validar formato cron
      if (!cron.validate(schedule)) {
        throw new Error('Formato de programación inválido');
      }

      // Crear el job
      const job = cron.schedule(schedule, async () => {
        try {
          logger.info(`Ejecutando backup automático: ${name}`);
          
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const fileName = `auto-backup-${name}-${timestamp}`;
          
          await this.backupService.createBackup({
            server,
            database,
            user,
            password,
            backupPath,
            fileName
          });

          // Limpiar backups antiguos
          await this.cleanOldBackups(retentionDays);
          
          logger.info(`Backup automático completado: ${name}`);
        } catch (error) {
          logger.error(`Error en backup automático ${name}:`, error);
        }
      }, {
        scheduled: false
      });

      // Guardar el job
      this.jobs.set(id, {
        job,
        config: jobConfig,
        status: 'created'
      });

      // Iniciar el job
      job.start();
      this.jobs.get(id).status = 'running';

      logger.info(`Job automático creado: ${name} - Programación: ${schedule}`);
      return { success: true, message: 'Job creado exitosamente' };

    } catch (error) {
      logger.error('Error creando job automático:', error);
      throw error;
    }
  }

  // Detener un job
  stopJob(jobId) {
    const jobInfo = this.jobs.get(jobId);
    if (jobInfo) {
      jobInfo.job.stop();
      jobInfo.status = 'stopped';
      logger.info(`Job detenido: ${jobInfo.config.name}`);
      return { success: true, message: 'Job detenido' };
    }
    return { success: false, message: 'Job no encontrado' };
  }

  // Iniciar un job
  startJob(jobId) {
    const jobInfo = this.jobs.get(jobId);
    if (jobInfo) {
      jobInfo.job.start();
      jobInfo.status = 'running';
      logger.info(`Job iniciado: ${jobInfo.config.name}`);
      return { success: true, message: 'Job iniciado' };
    }
    return { success: false, message: 'Job no encontrado' };
  }

  // Eliminar un job
  deleteJob(jobId) {
    const jobInfo = this.jobs.get(jobId);
    if (jobInfo) {
      jobInfo.job.stop();
      this.jobs.delete(jobId);
      logger.info(`Job eliminado: ${jobInfo.config.name}`);
      return { success: true, message: 'Job eliminado' };
    }
    return { success: false, message: 'Job no encontrado' };
  }

  // Obtener lista de jobs
  getJobs() {
    return Array.from(this.jobs.entries()).map(([id, jobInfo]) => ({
      id,
      name: jobInfo.config.name,
      schedule: jobInfo.config.schedule,
      status: jobInfo.status,
      server: jobInfo.config.server,
      database: jobInfo.config.database,
      lastRun: jobInfo.lastRun,
      nextRun: jobInfo.job.nextDate()
    }));
  }

  // Limpiar backups antiguos
  async cleanOldBackups(retentionDays) {
    try {
      const backupDir = process.env.BACKUP_DIR || './backups';
      const fs = require('fs').promises;
      const path = require('path');

      const files = await fs.readdir(backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      for (const file of files) {
        if (file.endsWith('.sql')) {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime < cutoffDate) {
            await fs.unlink(filePath);
            logger.info(`Backup antiguo eliminado: ${file}`);
          }
        }
      }
    } catch (error) {
      logger.error('Error limpiando backups antiguos:', error);
    }
  }

  // Obtener estadísticas de jobs
  getJobStats() {
    const jobs = this.getJobs();
    return {
      total: jobs.length,
      running: jobs.filter(j => j.status === 'running').length,
      stopped: jobs.filter(j => j.status === 'stopped').length,
      jobs: jobs
    };
  }
}

module.exports = SchedulerService; 