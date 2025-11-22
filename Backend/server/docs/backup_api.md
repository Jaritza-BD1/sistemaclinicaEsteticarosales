# API de Backup y Restore

Este documento describe los endpoints disponibles para gestionar backups de base de datos, su contrato (inputs/outputs) y notas operacionales.

Base path (backend): `/api/admin/backup`

Todos los endpoints requieren autenticación y rol administrador (middleware `authenticate` y `isAdmin`).

## Endpoints

- POST /test-connection
  - Descripción: Prueba la conexión a una base de datos usando credenciales proporcionadas.
  - Body (JSON): { server, database, user, password }
  - Response 200: { success: true, message: 'Conexión establecida exitosamente', databaseInfo: { name, totalSize, unallocatedSpace } }
  - Errores: 500 con { success: false, message }

- POST /create
  - Descripción: Genera un backup usando `mysqldump` y lo guarda en el directorio de backups.
  - Body (JSON): { server, database, user, password, backupPath, fileName }
    - `backupPath` opcional: si no se especifica, se usa el valor de `BACKUP_DIRECTORY` o `./backups`.
    - `fileName` prefijo para el archivo (se añade timestamp automáticamente y extensión .sql).
  - Response 200: { success: true, message: 'Backup creado exitosamente', backupInfo: { fileName, filePath, size, createdAt } }
  - Notas de seguridad: El servicio ejecuta un comando shell que incluye la contraseña. Asegurar entorno y permisos.

- GET /servers
  - Descripción: Lista de servidores sugeridos (puede venir de configuración).
  - Response: Array de strings.

- GET /databases?server=...
  - Descripción: Lista de bases de datos disponibles para el servidor dado.
  - Query params: server
  - Response: Array de strings.

- POST /restore
  - Descripción: Restaura un backup a una base de datos objetivo.
  - Body (JSON): { server, database, backupFile }
    - `backupFile` puede ser la ruta absoluta del .sql en el servidor o el nombre dentro del directorio de backups.
  - Response 200: { success: true, message: 'Backup restaurado exitosamente', restoreInfo: { restoredDatabase, backupFile, restoredAt } }
  - Notas: El método ejecuta `DROP DATABASE IF EXISTS` y luego crea la base de datos. Requiere credenciales con permisos de creación.

- GET /history
  - Descripción: Lista archivos .sql en el directorio de backups con metadatos.
  - Response 200: Array de objetos: { id, fileName, size, createdAt, path }

- DELETE /:backupId
  - Descripción: Elimina el archivo de backup identificado por `backupId` (nombre de archivo).
  - Response 200: { success: true, message: 'Backup eliminado exitosamente' }

- GET /download/:backupId
  - Descripción: Descarga el archivo `.sql`.
  - Response: attachment (res.download)

## Job automático

- Archivo: `Jobs/backup.job.js`
- Configuración por env:
  - `BACKUP_CRON` - expresión cron (por defecto `0 2 * * *` -> 02:00 AM)
  - `BACKUP_DIRECTORY` - directorio donde se guardan los .sql
  - `BACKUP_TIMEZONE` - timezone para el job (por defecto `America/Honduras`)

El job usa las credenciales definidas en `Config/environment.js` (variables `MYSQL_*`) para ejecutar `createBackup` automáticamente.

## Recomendaciones operativas
- Asegurar que `mysqldump` esté disponible en PATH del servidor.
- Evitar exponer credenciales en la UI; preferir que el job automático use credenciales de entorno y la UI ofrezca sólo backups manuales con usuario seguro.
- Considerar cifrado de backups y rotación/retención (por tamaño/días) como mejora futura.

## Errores comunes
- Permisos insuficientes para ejecutar mysqldump o escribir en `BACKUP_DIRECTORY`.
- Archivo de backup corrupto si el proceso se interrumpe. Ver logs en `utils/logger`.
