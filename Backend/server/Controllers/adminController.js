// controllers/adminController.js
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const User = require('../Models/User');
const PasswordHistory = require('../Models/PasswordHistory');
const Bitacora = require('../Models/Bitacora');
const { sendApprovalEmail } = require('../utils/mailer'); // Ajusta la ruta si es necesario

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
      ? { username: { [Op.like]: `%${search}%` } }
      : {};

    const { rows, count } = await User.findAndCountAll({
      where,
      order: [['createdAt','DESC']],
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
    const { username, email, password, autoGenerate } = req.body;

    if (!/@[^@]+\.[^@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const rawPwd = autoGenerate ? generarContraseña() : password;
    const hash   = await bcrypt.hash(rawPwd, 12);

    const expiresAt = new Date(
      Date.now() + (parseInt(process.env.ADMIN_DIAS_VIGENCIA, 10) || 30) * 86400000
    );

    const user = await User.create({
      username,
      email,
      password: hash,
      password_expires_at: expiresAt,
      last_password_change: new Date()
    });

    await PasswordHistory.create({
      ID_USUARIO: user.id,
      CONTRASENA: hash,
      CREADO_POR: req.user.username
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
    await User.update({ status: 'blocked' }, { where: { id } });
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

    const nuevaPlain = generarContraseña();
    const hash       = await bcrypt.hash(nuevaPlain, 12);

    await user.update({
      password: hash,
      last_password_change: new Date()
    });

    await PasswordHistory.create({
      ID_USUARIO: user.id,
      CONTRASENA: hash,
      CREADO_POR: req.user.username
    });

    res.json({
      success: true,
      message: 'Contraseña reseteada correctamente',
      nuevaContraseña: nuevaPlain
    });
  } catch (err) {
    console.error('Error al resetear contraseña:', err);
    next(err);
  }
}

// — Listar entradas de bitácora —
// GET /api/admin/logs?usuario=&from=&to=
async function listLogs(req, res, next) {
  try {
    const { usuario, from, to } = req.query;
    const where = {};

    if (usuario) {
      where.idUsuario = usuario;
    }
    if (from || to) {
      where.fecha = {};
      if (from) where.fecha[Op.gte] = new Date(from);
      if (to)   where.fecha[Op.lte] = new Date(to);
    }

    const logs = await Bitacora.findAll({
      where,
      order: [['fecha','DESC']],
      attributes: ['id','fecha','idUsuario','idObjeto','accion','descripcion']
    });

    res.json(logs);
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
    await Bitacora.destroy({ where: { id } });
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
      where: { atr_estado_usuario: 'Pendiente Aprobación' }
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
    if (user.atr_estado_usuario !== 'Pendiente Aprobación') {
      return res.status(400).json({ error: 'No está pendiente de aprobación' });
    }
    await user.update({ atr_estado_usuario: 'Activo' });
    await sendApprovalEmail(user.atr_correo_electronico);
    res.json({ message: 'Usuario aprobado exitosamente' });
  } catch (error) {
    console.error('Error aprobando usuario:', error);
    next(error);
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
  approveUser
};




