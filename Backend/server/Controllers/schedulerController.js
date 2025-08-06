const SchedulerService = require('../services/schedulerService');
const logger = require('../utils/logger');

class SchedulerController {
  constructor() {
    this.schedulerService = new SchedulerService();
  }

  // Crear un job automático
  async createJob(req, res) {
    try {
      const jobConfig = req.body;
      
      // Validaciones básicas
      if (!jobConfig.name || !jobConfig.schedule || !jobConfig.server || !jobConfig.database) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: name, schedule, server, database'
        });
      }

      // Generar ID único
      jobConfig.id = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await this.schedulerService.createBackupJob(jobConfig);
      
      logger.info(`Job automático creado: ${jobConfig.name}`);
      
      return res.status(201).json({
        success: true,
        message: 'Job automático creado exitosamente',
        data: {
          id: jobConfig.id,
          name: jobConfig.name,
          schedule: jobConfig.schedule,
          status: 'running'
        }
      });

    } catch (error) {
      logger.error('Error creando job automático:', error);
      return res.status(500).json({
        success: false,
        message: `Error creando job: ${error.message}`
      });
    }
  }

  // Obtener lista de jobs
  async getJobs(req, res) {
    try {
      const jobs = this.schedulerService.getJobs();
      
      return res.status(200).json({
        success: true,
        data: jobs
      });

    } catch (error) {
      logger.error('Error obteniendo jobs:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo jobs automáticos'
      });
    }
  }

  // Obtener estadísticas de jobs
  async getJobStats(req, res) {
    try {
      const stats = this.schedulerService.getJobStats();
      
      return res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Error obteniendo estadísticas de jobs:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas'
      });
    }
  }

  // Iniciar un job
  async startJob(req, res) {
    try {
      const { jobId } = req.params;
      const result = this.schedulerService.startJob(jobId);
      
      if (result.success) {
        logger.info(`Job iniciado: ${jobId}`);
        return res.status(200).json({
          success: true,
          message: 'Job iniciado exitosamente'
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Job no encontrado'
        });
      }

    } catch (error) {
      logger.error('Error iniciando job:', error);
      return res.status(500).json({
        success: false,
        message: 'Error iniciando job'
      });
    }
  }

  // Detener un job
  async stopJob(req, res) {
    try {
      const { jobId } = req.params;
      const result = this.schedulerService.stopJob(jobId);
      
      if (result.success) {
        logger.info(`Job detenido: ${jobId}`);
        return res.status(200).json({
          success: true,
          message: 'Job detenido exitosamente'
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Job no encontrado'
        });
      }

    } catch (error) {
      logger.error('Error deteniendo job:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deteniendo job'
      });
    }
  }

  // Eliminar un job
  async deleteJob(req, res) {
    try {
      const { jobId } = req.params;
      const result = this.schedulerService.deleteJob(jobId);
      
      if (result.success) {
        logger.info(`Job eliminado: ${jobId}`);
        return res.status(200).json({
          success: true,
          message: 'Job eliminado exitosamente'
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Job no encontrado'
        });
      }

    } catch (error) {
      logger.error('Error eliminando job:', error);
      return res.status(500).json({
        success: false,
        message: 'Error eliminando job'
      });
    }
  }

  // Actualizar configuración de un job
  async updateJob(req, res) {
    try {
      const { jobId } = req.params;
      const updateData = req.body;
      
      // Primero eliminar el job actual
      this.schedulerService.deleteJob(jobId);
      
      // Crear nuevo job con configuración actualizada
      const jobConfig = {
        id: jobId,
        ...updateData
      };
      
      const result = await this.schedulerService.createBackupJob(jobConfig);
      
      logger.info(`Job actualizado: ${jobId}`);
      
      return res.status(200).json({
        success: true,
        message: 'Job actualizado exitosamente',
        data: {
          id: jobId,
          name: jobConfig.name,
          schedule: jobConfig.schedule,
          status: 'running'
        }
      });

    } catch (error) {
      logger.error('Error actualizando job:', error);
      return res.status(500).json({
        success: false,
        message: `Error actualizando job: ${error.message}`
      });
    }
  }

  // Ejecutar job manualmente
  async executeJob(req, res) {
    try {
      const { jobId } = req.params;
      const jobInfo = this.schedulerService.jobs.get(jobId);
      
      if (!jobInfo) {
        return res.status(404).json({
          success: false,
          message: 'Job no encontrado'
        });
      }

      // Ejecutar el job manualmente
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `manual-backup-${jobInfo.config.name}-${timestamp}`;
      
      await this.schedulerService.backupService.createBackup({
        server: jobInfo.config.server,
        database: jobInfo.config.database,
        user: jobInfo.config.user,
        password: jobInfo.config.password,
        backupPath: jobInfo.config.backupPath,
        fileName
      });

      logger.info(`Job ejecutado manualmente: ${jobId}`);
      
      return res.status(200).json({
        success: true,
        message: 'Job ejecutado manualmente exitosamente'
      });

    } catch (error) {
      logger.error('Error ejecutando job manualmente:', error);
      return res.status(500).json({
        success: false,
        message: `Error ejecutando job: ${error.message}`
      });
    }
  }
}

module.exports = new SchedulerController(); 