const fs = require('fs').promises;
const path = require('path');
const cron = require('node-cron');
const logger = require('../utils/logger');
const { TreatmentProcedure, Exam, User } = require('../Models');

// Escanea recursivamente una carpeta y devuelve un array con rutas absolutas de archivos
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

async function findOrphanFiles() {
  const uploadsRoot = path.join(__dirname, '..', 'uploads');
  try { await fs.access(uploadsRoot); } catch (e) { logger.info('Uploads folder no existe, skip findOrphanFiles'); return []; }

  const files = await walkDir(uploadsRoot);

  // Build referenced set from multiple sources
  const referenced = new Set();

  // TreatmentProcedure images
  try {
    const rows = await TreatmentProcedure.findAll({ attributes: ['atr_imagen_pre', 'atr_imagen_post'] });
    rows.forEach(r => {
      if (r.atr_imagen_pre) referenced.add(path.basename(r.atr_imagen_pre));
      if (r.atr_imagen_post) referenced.add(path.basename(r.atr_imagen_post));
    });
  } catch (e) { logger.warn('No se pudieron leer TreatmentProcedure para referencias', e.message || e); }

  // Exam attachments (JSON array field atr_archivos_adjuntos)
  try {
    const exams = await Exam.findAll({ attributes: ['atr_archivos_adjuntos'] });
    exams.forEach(e => {
      const val = e.atr_archivos_adjuntos;
      if (!val) return;
      let arr = [];
      if (Array.isArray(val)) arr = val;
      else {
        try { arr = JSON.parse(val); } catch (err) { arr = []; }
      }
      arr.forEach(a => {
        if (!a) return;
        if (a.filename) referenced.add(a.filename);
        if (a.url) referenced.add(path.basename(a.url));
        if (a.name && a.name !== a.filename) referenced.add(a.name);
      });
    });
  } catch (e) { logger.warn('No se pudieron leer Exam para referencias', e.message || e); }

  // User avatars
  try {
    const users = await User.findAll({ attributes: ['atr_avatar'] });
    users.forEach(u => { if (u.atr_avatar) referenced.add(path.basename(u.atr_avatar)); });
  } catch (e) { logger.warn('No se pudieron leer User para referencias', e.message || e); }

  // Filter out files under uploads/trash (we don't consider trash files as candidates)
  const candidates = [];
  for (const f of files) {
    if (f.includes(path.join('uploads', 'trash'))) continue; // skip trash
    const base = path.basename(f);
    if (!referenced.has(base)) {
      const stats = await fs.stat(f);
      candidates.push({ path: f, basename: base, size: stats.size, mtime: stats.mtime });
    }
  }

  return candidates;
}

async function moveFilesToTrash(files) {
  if (!files || files.length === 0) return { moved: 0 };
  const trashRoot = path.join(__dirname, '..', 'uploads', 'trash');
  const dateFolder = new Date().toISOString().slice(0,10); // YYYY-MM-DD
  const destDir = path.join(trashRoot, dateFolder);
  try { await fs.mkdir(destDir, { recursive: true }); } catch (e) { /* ignore */ }

  let moved = 0;
  for (const f of files) {
    try {
      const dest = path.join(destDir, f.basename);
      await fs.rename(f.path, dest);
      moved++;
      logger.info('Movido a trash', { from: f.path, to: dest });
    } catch (e) {
      logger.warn('No se pudo mover archivo a trash', { file: f.path, error: e.message || e });
    }
  }
  return { moved };
}

async function cleanupUploadsOnce() {
  try {
    const candidates = await findOrphanFiles();
    if (!candidates || candidates.length === 0) {
      logger.info('Limpieza uploads: no hay candidatos a mover');
      return;
    }
    // By default move to trash
    const res = await moveFilesToTrash(candidates);
    logger.info(`Limpieza uploads: movidos a trash: ${res.moved}`);

    // Log run to DB if model available
    try {
      const CleanupRun = require('../Models').CleanupRun;
      if (CleanupRun) {
        await CleanupRun.create({
          atr_tipo: 'uploads',
          atr_moved_count: res.moved || 0,
          atr_deleted_count: 0,
          atr_details: { moved: (candidates || []).map(c => ({ from: c.path, basename: c.basename })) }
        });
      }
    } catch (e) {
      logger.warn('No se pudo registrar CleanupRun para uploads', e.message || e);
    }
  } catch (error) {
    logger.error('Error en cleanupUploads.job', error);
  }
}

// Programar job: por defecto una vez al día a las 03:00 AM
try {
  cron.schedule(process.env.CLEANUP_UPLOADS_CRON || '0 3 * * *', () => {
    cleanupUploadsOnce();
  }, { timezone: process.env.TZ || 'UTC' });
  logger.startup('Job cleanupUploads programado');
} catch (e) {
  logger.error('No fue posible programar cleanupUploads.job', e);
}

module.exports = { findOrphanFiles, moveFilesToTrash, cleanupUploadsOnce };
