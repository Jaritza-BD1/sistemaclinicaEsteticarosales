const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const config = require('../Config/environment');
const Models = require('../Models');

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

      // Registrar en la base de datos (incluye información sobre el trigger/usuario si se proporciona)
      await this.recordBackup({
        fileName: backupFileName,
        filePath: backupFilePath,
        database: database,
        server: server,
        size: await this.getFileSize(backupFilePath),
        triggeredBy: backupConfig.triggeredBy || null,
        createdBy: backupConfig.createdBy || null
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
  async getBackupHistory({ page = 1, limit = 20 } = {}) {
    try {
      // Preferir registros en la base de datos si el modelo existe
      if (Models && Models.Backup) {
        try {
          const offset = (Math.max(parseInt(page, 10) || 1, 1) - 1) * Math.max(parseInt(limit, 10) || 20, 1);
          const l = Math.max(parseInt(limit, 10) || 20, 1);
          const result = await Models.Backup.findAndCountAll({
            order: [['atr_created_at', 'DESC']],
            offset,
            limit: l
          });

          const pages = Math.ceil(result.count / l) || 1;
          return {
            total: result.count,
            page: Math.max(parseInt(page, 10) || 1, 1),
            pages,
            data: result.rows.map(r => ({
              id: r.atr_id_backup,
              fileName: r.atr_file_name,
              size: r.atr_size,
              createdAt: r.atr_created_at,
              path: r.atr_file_path,
              createdBy: r.atr_created_by,
              triggeredBy: r.atr_triggered_by
            }))
          };
        } catch (e) {
          logger.error('Error consultando backups desde DB, fallback a FS', e);
        }
      }

      // Fallback: listar archivos en filesystem (no paginado)
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

      const sorted = history.sort((a, b) => b.createdAt - a.createdAt);
      return {
        total: sorted.length,
        page: 1,
        pages: 1,
        data: sorted
      };
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
      // Intentar registrar en la tabla de backups si el modelo está disponible
      logger.info('Backup registrado:', backupInfo);
      if (Models && Models.Backup) {
        try {
          await Models.Backup.create({
            atr_file_name: backupInfo.fileName,
            atr_file_path: backupInfo.filePath,
            atr_size: backupInfo.size,
            atr_created_at: new Date(),
            atr_triggered_by: backupInfo.triggeredBy || null,
            atr_created_by: backupInfo.createdBy || null
          });
          logger.info('Backup persisted in DB');
        } catch (e) {
          logger.error('Error persisting backup in DB', e);
        }
      }
    } catch (error) {
      logger.error('Error registrando backup:', error);
    }
  }

  // Eliminar backups antiguos por días o mantener máximo de archivos
  async cleanupOldBackups({ retentionDays = 30, maxFiles = 0 } = {}) {
    try {
      const files = await fs.readdir(this.backupDirectory);
      const sqlFiles = [];
      for (const f of files) {
        if (f.endsWith('.sql')) {
          const p = path.join(this.backupDirectory, f);
          const stats = await fs.stat(p);
          sqlFiles.push({ file: f, path: p, mtime: stats.mtimeMs, birthtime: stats.birthtimeMs });
        }
      }

      // Ordenar por fecha (más reciente primero)
      sqlFiles.sort((a, b) => b.mtime - a.mtime);

      // Borrar por retención de días
      if (retentionDays && retentionDays > 0) {
        const cutoff = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
        for (const f of sqlFiles) {
          if (f.mtime < cutoff) {
            await fs.unlink(f.path);
            logger.info(`Backup eliminado por retención: ${f.file}`);
            // also remove from sqlFiles array
          }
        }
      }

      // Si maxFiles > 0, mantener solo los más recientes
      if (maxFiles && maxFiles > 0) {
        const remaining = sqlFiles.slice(0, maxFiles);
        const toDelete = sqlFiles.slice(maxFiles);
        for (const f of toDelete) {
          try {
            await fs.unlink(f.path);
            logger.info(`Backup eliminado por límite de archivo: ${f.file}`);
          } catch (e) {
            logger.error('Error eliminando backup durante rotación', e);
          }
        }
      }

      return true;
    } catch (error) {
      logger.error('Error en cleanupOldBackups', error);
      return false;
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