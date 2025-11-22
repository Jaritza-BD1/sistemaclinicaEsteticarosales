// controllers/adminController.js
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../Models/User');
const PasswordHistory = require('../Models/PasswordHistory');
const Bitacora = require('../Models/Bitacora');
const Token = require('../Models/tokenmodel');
const BitacoraService = require('../services/bitacoraService');
const { sendApprovalEmail, sendPasswordResetCodeEmail } = require('../utils/mailer'); // Ajusta la ruta si es necesario
const cleanupJob = require('../Jobs/cleanupUploads.job');
const ResponseService = require('../services/responseService');
const path = require('path');
const fs = require('fs').promises;
const { CleanupRun } = require('../Models');

// List files in trash (admin)
async function listTrash(req, res, next) {
  try {
    const trashRoot = path.join(__dirname, '..', 'uploads', 'trash');
    try { await fs.access(trashRoot); } catch (e) { return ResponseService.success(res, []); }

    // Walk trash folder
    async function walk(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const out = [];
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          const nested = await walk(full);
          out.push(...nested);
        } else if (e.isFile()) {
          const stats = await fs.stat(full);
          out.push({ path: full, name: e.name, size: stats.size, mtime: stats.mtime });
        }
      }
      return out;
    }

    const files = await walk(trashRoot);
    return ResponseService.success(res, files);
  } catch (e) {
    console.error('Error listando trash:', e);
    next(e);
  }
}

// Restore a file from trash to given destination (or default restored folder)
async function restoreTrashFile(req, res, next) {
  try {
    const { trashPath, destRelative } = req.body; // trashPath must be absolute on server or relative to uploads/trash
    if (!trashPath) return ResponseService.badRequest(res, 'trashPath es requerido');

    const uploadsRoot = path.join(__dirname, '..', 'uploads');
    let absoluteTrashPath = trashPath;
    if (!path.isAbsolute(trashPath)) {
      absoluteTrashPath = path.join(uploadsRoot, 'trash', trashPath);
    }

    try { await fs.access(absoluteTrashPath); } catch (e) { return ResponseService.notFound(res, 'Archivo en trash no encontrado'); }

    const dest = destRelative ? path.join(uploadsRoot, destRelative) : path.join(uploadsRoot, 'restored', new Date().toISOString().slice(0,10));
    await fs.mkdir(dest, { recursive: true });
    const destPath = path.join(dest, path.basename(absoluteTrashPath));
    await fs.rename(absoluteTrashPath, destPath);

    // Log run in DB
    try {
      const CleanupRun = require('../Models').CleanupRun;
      if (CleanupRun) {
        await CleanupRun.create({ atr_tipo: 'restore', atr_ejecutado_por: req.user?.atr_id_usuario || null, atr_details: { from: absoluteTrashPath, to: destPath } });
      }
    } catch (e) { /* ignore logging errors */ }

    return ResponseService.success(res, { restoredTo: destPath });
  } catch (e) {
    console.error('Error restaurando file del trash:', e);
    next(e);
  }
}

// Permanently delete a file from trash
async function deleteTrashFile(req, res, next) {
  try {
    const { trashPath } = req.body;
    if (!trashPath) return ResponseService.badRequest(res, 'trashPath es requerido');
    const uploadsRoot = path.join(__dirname, '..', 'uploads');
    let absoluteTrashPath = trashPath;
    if (!path.isAbsolute(trashPath)) absoluteTrashPath = path.join(uploadsRoot, 'trash', trashPath);
    try { await fs.access(absoluteTrashPath); } catch (e) { return ResponseService.notFound(res, 'Archivo en trash no encontrado'); }
    await fs.unlink(absoluteTrashPath);

    try {
      const CleanupRun = require('../Models').CleanupRun;
      if (CleanupRun) {
        await CleanupRun.create({ atr_tipo: 'delete_trash', atr_ejecutado_por: req.user?.atr_id_usuario || null, atr_deleted_count: 1, atr_details: { file: absoluteTrashPath } });
      }
    } catch (e) { /* ignore */ }

    return ResponseService.success(res, { message: 'Archivo eliminado del trash' });
  } catch (e) {
    console.error('Error eliminando file del trash:', e);
    next(e);
  }
}

// List CleanupRun executions with pagination and optional filters
async function listCleanupRuns(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const where = {};

    if (req.query.type) {
      where.atr_tipo = req.query.type;
    }
    if (req.query.from || req.query.to) {
      where.atr_fecha_ejecucion = {};
      if (req.query.from) where.atr_fecha_ejecucion['$gte'] = new Date(req.query.from);
      if (req.query.to) where.atr_fecha_ejecucion['$lte'] = new Date(req.query.to);
    }

    const { rows, count } = await CleanupRun.findAndCountAll({ where, order: [['atr_fecha_ejecucion', 'DESC']], limit, offset });

    return ResponseService.paginated(res, rows, page, limit, count);
  } catch (e) {
    console.error('Error listando CleanupRun:', e);
    next(e);
  }
}

// Helper para generar una contraseña aleatoria
function generarContraseña(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

// — Listar usuarios con paginación y búsqueda —
// GET /api/admin/users?page=&limit=&search=
async function listUsers(req, res, next) {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.max(1, parseInt(req.query.limit) || 10);
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    const where = search
      ? { atr_usuario: { [Op.like]: `%${search}%` } }
      : {};

    const { rows, count } = await User.findAndCountAll({
      where,
      order: [['atr_fecha_creacion','DESC']],
      offset, limit
    });

    res.json({
      data: rows,
      meta: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Error listando usuarios:', err);
    next(err);
  }
}

// — Crear usuario y guardar en historial de contraseñas —
// POST /api/admin/users
async function createUser(req, res, next) {
  try {
    const { username, name, email, password, autoGenerate } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!username || !name || !email) {
      return res.status(400).json({ error: 'Usuario, nombre y email son obligatorios' });
    }

    if (!/@[^@]+\.[^@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const rawPwd = autoGenerate ? generarContraseña() : password;
    const hash = await bcrypt.hash(rawPwd, 12);

    const expiresAt = new Date(
      Date.now() + (parseInt(process.env.ADMIN_DIAS_VIGENCIA, 10) || 30) * 86400000
    );

    // Mapear posibles claves que vengan del frontend
    const atr2fa = req.body.dos_fa_enabled !== undefined
      ? Boolean(req.body.dos_fa_enabled)
      : (req.body.atr_2fa_enabled !== undefined ? Boolean(req.body.atr_2fa_enabled) : false);

    const user = await User.create({
      atr_usuario: username.toUpperCase(),
      atr_nombre_usuario: name,
      atr_correo_electronico: email.toLowerCase(),
      atr_contrasena: hash,
      atr_fecha_vencimiento: expiresAt,
      atr_estado_usuario: 'ACTIVO',
      atr_primer_ingreso: true,
      atr_id_rol: 2,
      atr_2fa_enabled: atr2fa
    });

    await PasswordHistory.create({
      atr_id_usuario: user.atr_id_usuario,
      atr_contrasena: hash,
      atr_creado_por: req.user.atr_usuario
    });

    res.status(201).json({
      success: true,
      user,
      plainPassword: rawPwd
    });
  } catch (err) {
    console.error('Error creando usuario:', err);
    next(err);
  }
}

// — Bloquear usuario —
// PATCH /api/admin/users/:id/block
async function blockUser(req, res, next) {
  try {
    const { id } = req.params;
    await User.update({ atr_estado_usuario: 'BLOQUEADO' }, { where: { atr_id_usuario: id } });
    res.json({ success: true, message: 'Usuario bloqueado' });
  } catch (err) {
    console.error('Error bloqueando usuario:', err);
    next(err);
  }
}

// — Resetear contraseña y guardar en historial —
// PATCH /api/admin/users/:id/reset-password
async function resetUserPassword(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Nuevo flujo: en vez de cambiar la contraseña aquí, generamos un OTP de restablecimiento
    // y lo enviamos por email al usuario (mismo flujo que forgotPassword).

    // Invalidar OTPs anteriores del mismo tipo
    await Token.update({ atr_utilizado: true }, {
      where: {
        atr_id_usuario: user.atr_id_usuario,
        atr_tipo: 'PASSWORD_RESET_OTP',
        atr_utilizado: false
      }
    });

    // Generar OTP y expiración (10 minutos)
    const otpCode = Token.generateOTP();
    const expiration = Token.generateExpirationDate(10);

    // Crear nuevo token OTP para restablecimiento de contraseña
    await Token.create({
      atr_id_usuario: user.atr_id_usuario,
      atr_codigo: otpCode,
      atr_tipo: 'PASSWORD_RESET_OTP',
      atr_fecha_expiracion: expiration,
      atr_creado_por: req.user?.atr_usuario || 'ADMIN'
    });

    // Limpiar intentos de login y expiraciones previas para evitar bloqueos inmediatos
    await user.update({ atr_intentos_fallidos: 0, atr_reset_expiry: null });

    // Enviar el OTP por email
    try {
      await sendPasswordResetCodeEmail(user.atr_correo_electronico, otpCode, user.atr_nombre_usuario || user.atr_usuario);
    } catch (mailErr) {
      console.error('Error enviando OTP por email en resetUserPassword:', mailErr);
      return res.status(500).json({ error: 'Error enviando el código por email' });
    }

    // Registrar en bitácora que el admin solicitó restablecimiento para el usuario
    try {
      await BitacoraService.registrarEvento({
        atr_id_usuario: req.user?.atr_id_usuario || null,
        atr_id_objetos: 1,
        atr_accion: 'ResetPasswordRequest',
        atr_descripcion: `Admin ${req.user?.atr_usuario || 'ADMIN'} generó OTP de restablecimiento para usuario ${user.atr_usuario}`,
        ip_origen: req.ip
      });
    } catch (e) {
      // No bloquear el flujo si falla la bitácora
      console.error('No se pudo registrar en bitácora el reset por admin:', e);
    }

    return res.json({ success: true, message: 'Código OTP enviado al correo del usuario' });
  } catch (err) {
    console.error('Error al resetear contraseña:', err);
    next(err);
  }
}

// — Listar entradas de bitácora —
// GET /api/admin/logs?usuario=&from=&to=&limit=&offset=
async function listLogs(req, res, next) {
  try {
    const { usuario, from, to, limit = 10, offset = 0 } = req.query;
    const where = {};

    if (usuario) {
      where.atr_id_usuario = usuario;
    }
    if (from || to) {
      where.atr_fecha = {};
      if (from) where.atr_fecha[Op.gte] = new Date(from);
      if (to)   where.atr_fecha[Op.lte] = new Date(to);
    }

    // Obtener el total de registros para la paginación
    const total = await Bitacora.count({ where });

    // Obtener los registros con paginación
    const logs = await Bitacora.findAll({
      where,
      order: [['atr_fecha','DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        ['atr_id_bitacora', 'id'],
        ['atr_fecha', 'fecha'],
        ['atr_id_usuario', 'idUsuario'],
        ['atr_id_objetos', 'idObjeto'],
        ['atr_accion', 'accion'],
        ['atr_descripcion', 'descripcion']
      ]
    });

    // Calcular información de paginación
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: logs,
      pagination: {
        currentPage,
        totalPages,
        totalRecords: total,
        itemsPerPage: parseInt(limit),
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      }
    });
  } catch (err) {
    console.error('Error listando logs:', err);
    next(err);
  }
}

// — Eliminar entrada de bitácora —
// DELETE /api/admin/logs/:id
async function deleteLogEntry(req, res, next) {
  try {
    const { id } = req.params;
    await Bitacora.destroy({ where: { atr_id_bitacora: id } });
    res.json({ success: true, message: 'Registro eliminado' });
  } catch (err) {
    console.error('Error eliminando log:', err);
    next(err);
  }
}

// — Listar usuarios pendientes de aprobación —
// GET /api/admin/pending-users
async function getPendingUsers(req, res, next) {
  try {
    const list = await User.findAll({
      where: { atr_estado_usuario: 'PENDIENTE_APROBACION' }
    });
    const safe = list.map(u => {
      const j = u.toJSON();
      delete j.atr_contrasena;
      delete j.atr_reset_token;
      delete j.atr_reset_expiry;
      return j;
    });
    res.json(safe);
  } catch (error) {
    console.error('Error listando usuarios pendientes:', error);
    next(error);
  }
}

// — Aprobar usuario —
// POST /api/admin/approve-user/:id
async function approveUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    if (user.atr_estado_usuario !== 'PENDIENTE_APROBACION') {
      return res.status(400).json({ error: 'No está pendiente de aprobación' });
    }
    await user.update({ atr_estado_usuario: 'ACTIVO', atr_is_approved: true });
    await sendApprovalEmail(user.atr_correo_electronico);
    res.json({ message: 'Usuario aprobado exitosamente' });
  } catch (error) {
    console.error('Error aprobando usuario:', error);
    next(error);
  }
}

// — Desbloquear usuario —
// PATCH /api/admin/users/:id/unblock
async function unblockUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    await user.update({ atr_estado_usuario: 'ACTIVO', atr_intentos_fallidos: 0, atr_reset_expiry: null });
    res.json({ success: true, message: 'Usuario desbloqueado' });
  } catch (err) {
    console.error('Error desbloqueando usuario:', err);
    next(err);
  }
}

// — Eliminar usuario —
// DELETE /api/admin/users/:id
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    await user.destroy();
    res.json({ success: true, message: 'Usuario eliminado' });
  } catch (err) {
    console.error('Error eliminando usuario:', err);
    next(err);
  }
}

// -> Preview orphan uploads candidates (admin)
async function uploadsPreview(req, res, next) {
  try {
    const candidates = await cleanupJob.findOrphanFiles();
    // Return limited metadata to admin
    const safe = candidates.map(c => ({ path: c.path, basename: c.basename, size: c.size, mtime: c.mtime }));
    return ResponseService.success(res, safe);
  } catch (e) {
    console.error('Error obteniendo preview uploads:', e);
    next(e);
  }
}

// -> Move orphan files to trash (admin trigger)
async function runUploadsCleanup(req, res, next) {
  try {
    const candidates = await cleanupJob.findOrphanFiles();
    if (!candidates || candidates.length === 0) return ResponseService.success(res, { moved: 0, message: 'No hay archivos candidatos' });
    const result = await cleanupJob.moveFilesToTrash(candidates);
    return ResponseService.success(res, { moved: result.moved });
  } catch (e) {
    console.error('Error ejecutando cleanup uploads por admin:', e);
    next(e);
  }
}

module.exports = {
  listUsers,
  createUser,
  blockUser,
  resetUserPassword,
  listLogs,
  deleteLogEntry,
  getPendingUsers,
  approveUser,
  unblockUser,
  deleteUser
  ,
  uploadsPreview,
  runUploadsCleanup,
  listTrash,
  restoreTrashFile,
  deleteTrashFile
  ,
  listCleanupRuns
};




