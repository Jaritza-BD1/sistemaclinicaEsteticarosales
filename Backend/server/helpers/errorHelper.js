// helpers/errorHelper.js
const { sequelize } = require('../Config/db');
const fs = require('fs');
const path = require('path');

class ErrorHelper {
    /**
     * Registra errores en archivo de log y base de datos
     * @param {string} errorMessage - Mensaje de error descriptivo
     * @param {Object} [errorDetails] - Detalles adicionales del error
     * @param {string} [errorDetails.stack] - Stack trace del error
     * @param {string} [errorDetails.endpoint] - Endpoint donde ocurrió
     * @param {number} [errorDetails.userId] - ID de usuario relacionado
     */
    static async logError(errorMessage, errorDetails = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = this._formatLogEntry(timestamp, errorMessage, errorDetails);
        
        try {
            // 1. Registrar en archivo de log
            this._writeToFile(logEntry);
            
            // 2. Registrar en base de datos (si está configurado)
            if (process.env.LOG_ERRORS_TO_DB === 'true') {
                await this._saveToDatabase(timestamp, errorMessage, errorDetails);
            }
            
            // 3. Registrar en consola (solo en desarrollo)
            if (process.env.NODE_ENV === 'development') {
                console.error(logEntry);
            }
        } catch (dbError) {
            // Fallback solo a archivo si hay error con la base de datos
            this._writeToFile(`[DB-ERROR] ${logEntry}`);
            console.error('Error al registrar error en BD:', dbError);
        }
    }

    /**
     * Formatea la entrada de log
     * @private
     */
    static _formatLogEntry(timestamp, message, details) {
        let entry = `[${timestamp}] ERROR: ${message}\n`;
        if (details.stack) entry += `Stack: ${details.stack}\n`;
        if (details.endpoint) entry += `Endpoint: ${details.endpoint}\n`;
        if (details.userId) entry += `UserID: ${details.userId}\n`;
        return entry;
    }

    /**
     * Escribe en archivo de log
     * @private
     */
    static _writeToFile(content) {
        const logDir = path.join(__dirname, '../../logs');
        const logFile = path.join(logDir, 'errors.log');
        
        // Crear directorio si no existe
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        // Escribir en archivo
        fs.appendFileSync(logFile, `${content}\n`, { encoding: 'utf8' });
    }

    /**
     * Guarda error en base de datos
     * @private
     */
    static async _saveToDatabase(timestamp, message, details) {
        await sequelize.query(
            `INSERT INTO TBL_MS_ERROR_LOG (
                FECHA,
                MENSAJE,
                STACK_TRACE,
                ENDPOINT,
                ID_USUARIO,
                METODO_HTTP,
                IP_ORIGEN
            ) VALUES (
                :timestamp,
                :message,
                :stack,
                :endpoint,
                :userId,
                :method,
                :ip
            )`,
            {
                replacements: {
                    timestamp,
                    message,
                    stack: details.stack || null,
                    endpoint: details.endpoint || null,
                    userId: details.userId || null,
                    method: details.method || null,
                    ip: details.ip || null
                }
            }
        );
    }

    /**
     * Envía notificaciones de errores críticos
     * @param {string} errorMessage 
     */
    static async notifyCriticalError(errorMessage) {
        // Implementación básica - puede extenderse con Slack/Email/etc.
        if (process.env.NOTIFY_CRITICAL_ERRORS === 'true') {
            console.error(`[CRITICAL ERROR NOTIFICATION] ${errorMessage}`);
            // Aquí iría la lógica para enviar a Slack, Email, etc.
        }
    }
}

module.exports = ErrorHelper;