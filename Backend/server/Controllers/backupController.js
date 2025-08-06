const backupService = require('../services/backupService');
const logger = require('../utils/logger');

class BackupController {
  // Probar conexión a la base de datos
  async testConnection(req, res) {
    try {
      const { server, database, user, password } = req.body;
      
      logger.info(`Probando conexión a BD: ${server}/${database}`);
      
      const result = await backupService.testConnection({
        server,
        database,
        user,
        password
      });
      
      res.json({
        success: true,
        message: 'Conexión establecida exitosamente',
        databaseInfo: result.databaseInfo
      });
    } catch (error) {
      logger.error('Error probando conexión:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al probar la conexión'
      });
    }
  }

  // Crear backup
  async createBackup(req, res) {
    try {
      const {
        server,
        database,
        user,
        password,
        backupPath,
        fileName
      } = req.body;
      
      logger.info(`Creando backup: ${database} -> ${backupPath}/${fileName}`);
      
      const result = await backupService.createBackup({
        server,
        database,
        user,
        password,
        backupPath,
        fileName
      });
      
      res.json({
        success: true,
        message: 'Backup creado exitosamente',
        backupInfo: result
      });
    } catch (error) {
      logger.error('Error creando backup:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear el backup'
      });
    }
  }

  // Obtener servidores disponibles
  async getAvailableServers(req, res) {
    try {
      const servers = await backupService.getAvailableServers();
      res.json(servers);
    } catch (error) {
      logger.error('Error obteniendo servidores:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener servidores'
      });
    }
  }

  // Obtener bases de datos disponibles
  async getAvailableDatabases(req, res) {
    try {
      const { server } = req.query;
      const databases = await backupService.getAvailableDatabases(server);
      res.json(databases);
    } catch (error) {
      logger.error('Error obteniendo bases de datos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener bases de datos'
      });
    }
  }

  // Restaurar backup
  async restoreBackup(req, res) {
    try {
      const {
        server,
        database,
        backupFile
      } = req.body;
      
      logger.info(`Restaurando backup: ${backupFile} -> ${server}/${database}`);
      
      const result = await backupService.restoreBackup({
        server,
        database,
        backupFile
      });
      
      res.json({
        success: true,
        message: 'Backup restaurado exitosamente',
        restoreInfo: result
      });
    } catch (error) {
      logger.error('Error restaurando backup:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al restaurar el backup'
      });
    }
  }

  // Obtener historial de backups
  async getBackupHistory(req, res) {
    try {
      const history = await backupService.getBackupHistory();
      res.json(history);
    } catch (error) {
      logger.error('Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener el historial'
      });
    }
  }

  // Eliminar backup
  async deleteBackup(req, res) {
    try {
      const { backupId } = req.params;
      
      logger.info(`Eliminando backup: ${backupId}`);
      
      await backupService.deleteBackup(backupId);
      
      res.json({
        success: true,
        message: 'Backup eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando backup:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar el backup'
      });
    }
  }

  // Descargar backup
  async downloadBackup(req, res) {
    try {
      const { backupId } = req.params;
      
      logger.info(`Descargando backup: ${backupId}`);
      
      const { filePath, fileName } = await backupService.getBackupFile(backupId);
      
      res.download(filePath, fileName);
    } catch (error) {
      logger.error('Error descargando backup:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al descargar el backup'
      });
    }
  }
}

module.exports = new BackupController(); 