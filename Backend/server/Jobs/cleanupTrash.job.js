const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');
const logger = require('../utils/logger');

async function walkDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await walkDir(full);
      files.push(...nested);
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

async function cleanupTrashOnce() {
  try {
    const trashRoot = path.join(__dirname, '..', 'uploads', 'trash');
    try { await fs.access(trashRoot); } catch (e) { logger.info('Trash folder no existe, skip cleanupTrash'); return; }

    const retentionDays = parseInt(process.env.CLEANUP_TRASH_DAYS || '30', 10);
    const now = Date.now();
    const cutoff = now - retentionDays * 24 * 60 * 60 * 1000;

    const files = await walkDir(trashRoot);
    let deleted = 0;
    for (const f of files) {
      try {
        const stats = await fs.stat(f);
        if (stats.mtime.getTime() < cutoff) {
          await fs.unlink(f);
          deleted++;
          logger.info('Archivo trash eliminado por retención', { file: f });
        }
      } catch (e) {
        logger.warn('Error comprobando/eliminando archivo trash', { file: f, error: e.message || e });
      }
    }

    logger.info(`cleanupTrash: archivos eliminados: ${deleted}`);
    // Log run to DB
    try {
      const CleanupRun = require('../Models').CleanupRun;
      if (CleanupRun) {
        await CleanupRun.create({
          atr_tipo: 'trash',
          atr_moved_count: 0,
          atr_deleted_count: deleted || 0,
          atr_details: { deleted }
        });
      }
    } catch (e) {
      logger.warn('No se pudo registrar CleanupRun para trash', e.message || e);
    }
  } catch (error) {
    logger.error('Error en cleanupTrash.job', error);
  }
}

try {
  cron.schedule(process.env.CLEANUP_TRASH_CRON || '30 3 * * *', () => {
    cleanupTrashOnce();
  }, { timezone: process.env.TZ || 'UTC' });
  logger.startup('Job cleanupTrash programado');
} catch (e) {
  logger.error('No fue posible programar cleanupTrash.job', e);
}

module.exports = { cleanupTrashOnce };
