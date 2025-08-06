const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const config = require('../Config/environment');

class BackupService {
  constructor() {
    this.backupDirectory = process.env.BACKUP_DIRECTORY || './backups';
    this.ensureBackupDirectory();
  }

  // Asegurar que existe el directorio de backups
  async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDirectory);
    } catch (error) {
      await fs.mkdir(this.backupDirectory, { recursive: true });
      logger.info(`Directorio de backup creado: ${this.backupDirectory}`);
    }
  }

  // Probar conexión a la base de datos
  async testConnection(connectionConfig) {
    try {
      const { server, database, user, password } = connectionConfig;
      
      // Crear conexión de prueba
      const connection = await mysql.createConnection({
        host: server,
        user: user,
        password: password,
        database: database
      });

      // Obtener información de la base de datos
      const [rows] = await connection.execute(`
        SELECT 
          table_schema as database_name,
          ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS total_size_mb,
          ROUND(SUM(data_free) / 1024 / 1024, 2) AS unallocated_space_mb
        FROM information_schema.tables 
        WHERE table_schema = ?
        GROUP BY table_schema
      `, [database]);

      await connection.end();

      const dbInfo = rows[0] || {};
      
      return {
        databaseInfo: {
          name: database,
          totalSize: `${dbInfo.total_size_mb || 0} MB`,
          unallocatedSpace: `${dbInfo.unallocated_space_mb || 0} MB`
        }
      };
    } catch (error) {
      logger.error('Error probando conexión:', error);
      throw new Error(`Error de conexión: ${error.message}`);
    }
  }

  // Crear backup
  async createBackup(backupConfig) {
    try {
      const { server, database, user, password, backupPath, fileName } = backupConfig;
      
      // Crear conexión
      const connection = await mysql.createConnection({
        host: server,
        user: user,
        password: password,
        database: database
      });

      // Generar nombre de archivo con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `${fileName}-${timestamp}.sql`;
      const backupFilePath = path.join(backupPath, backupFileName);

      // Crear backup usando mysqldump
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);

      const mysqldumpCommand = `mysqldump -h ${server} -u ${user} -p${password} ${database} > "${backupFilePath}"`;
      
      await execAsync(mysqldumpCommand);

      // Verificar que el archivo se creó
      await fs.access(backupFilePath);

      await connection.end();

      // Registrar en la base de datos
      await this.recordBackup({
        fileName: backupFileName,
        filePath: backupFilePath,
        database: database,
        server: server,
        size: await this.getFileSize(backupFilePath)
      });

      logger.info(`Backup creado exitosamente: ${backupFilePath}`);

      return {
        fileName: backupFileName,
        filePath: backupFilePath,
        size: await this.getFileSize(backupFilePath),
        createdAt: new Date()
      };
    } catch (error) {
      logger.error('Error creando backup:', error);
      throw new Error(`Error creando backup: ${error.message}`);
    }
  }

  // Obtener servidores disponibles
  async getAvailableServers() {
    try {
      // En un entorno real, esto podría consultar una configuración
      // o detectar servidores en la red
      return ['localhost', '(local)', 'CRISTIAN', '127.0.0.1'];
    } catch (error) {
      logger.error('Error obteniendo servidores:', error);
      throw error;
    }
  }

  // Obtener bases de datos disponibles
  async getAvailableDatabases(server) {
    try {
      // En un entorno real, esto consultaría las bases de datos del servidor
      return ['Farmacia', 'master', 'tempdb', 'mysql', 'information_schema'];
    } catch (error) {
      logger.error('Error obteniendo bases de datos:', error);
      throw error;
    }
  }

  // Restaurar backup
  async restoreBackup(restoreConfig) {
    try {
      const { server, database, backupFile } = restoreConfig;
      
      // Verificar que el archivo existe
      await fs.access(backupFile);

      // Crear conexión
      const connection = await mysql.createConnection({
        host: server,
        user: config.database.user,
        password: config.database.password
      });

      // Leer el archivo de backup
      const backupContent = await fs.readFile(backupFile, 'utf8');

      // Ejecutar el script de restauración
      await connection.execute(`DROP DATABASE IF EXISTS ${database}`);
      await connection.execute(`CREATE DATABASE ${database}`);
      await connection.execute(`USE ${database}`);
      
      // Dividir el script en comandos individuales
      const commands = backupContent.split(';').filter(cmd => cmd.trim());
      
      for (const command of commands) {
        if (command.trim()) {
          await connection.execute(command);
        }
      }

      await connection.end();

      logger.info(`Backup restaurado exitosamente: ${backupFile} -> ${database}`);

      return {
        restoredDatabase: database,
        backupFile: backupFile,
        restoredAt: new Date()
      };
    } catch (error) {
      logger.error('Error restaurando backup:', error);
      throw new Error(`Error restaurando backup: ${error.message}`);
    }
  }

  // Obtener historial de backups
  async getBackupHistory() {
    try {
      // En un entorno real, esto consultaría una tabla de la base de datos
      const backupFiles = await fs.readdir(this.backupDirectory);
      const history = [];

      for (const file of backupFiles) {
        if (file.endsWith('.sql')) {
          const filePath = path.join(this.backupDirectory, file);
          const stats = await fs.stat(filePath);
          
          history.push({
            id: file,
            fileName: file,
            size: await this.getFileSize(filePath),
            createdAt: stats.birthtime,
            path: filePath
          });
        }
      }

      return history.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      logger.error('Error obteniendo historial:', error);
      throw error;
    }
  }

  // Eliminar backup
  async deleteBackup(backupId) {
    try {
      const filePath = path.join(this.backupDirectory, backupId);
      await fs.unlink(filePath);
      
      logger.info(`Backup eliminado: ${backupId}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Error eliminando backup:', error);
      throw error;
    }
  }

  // Obtener archivo de backup
  async getBackupFile(backupId) {
    try {
      const filePath = path.join(this.backupDirectory, backupId);
      await fs.access(filePath);
      
      return {
        filePath: filePath,
        fileName: backupId
      };
    } catch (error) {
      logger.error('Error obteniendo archivo de backup:', error);
      throw error;
    }
  }

  // Registrar backup en la base de datos
  async recordBackup(backupInfo) {
    try {
      // En un entorno real, esto insertaría en una tabla de la base de datos
      logger.info('Backup registrado:', backupInfo);
    } catch (error) {
      logger.error('Error registrando backup:', error);
    }
  }

  // Obtener tamaño de archivo
  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      return `${sizeInMB} MB`;
    } catch (error) {
      return '0 MB';
    }
  }
}

module.exports = BackupService; 