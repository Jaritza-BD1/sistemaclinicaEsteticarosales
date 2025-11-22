const models = require('../Models');
const ResponseService = require('../services/responseService');
const logger = require('../utils/logger');

// Helper to record actions in Bitacora when possible
const recordBitacora = async (req, action, description, modelName) => {
  try {
    if (!models.Bitacora) return;
    let objetoId = null;
    if (models.Objeto) {
      const nameVariants = [modelName, modelName.toUpperCase(), modelName.toLowerCase(), modelName.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '')];
      const obj = await models.Objeto.findOne({ where: { atr_objeto: nameVariants[0] } })
        || await models.Objeto.findOne({ where: { atr_objeto: nameVariants[1] } })
        || await models.Objeto.findOne({ where: { atr_objeto: nameVariants[2] } })
        || await models.Objeto.findOne({ where: { atr_objeto: nameVariants[3] } });
      if (obj) objetoId = obj.atr_id_objetos;
    }

    await models.Bitacora.create({
      atr_fecha: new Date(),
      atr_id_usuario: req.user ? req.user.atr_id_usuario : null,
      atr_id_objetos: objetoId || 0,
      atr_accion: action,
      atr_descripcion: description || `${action} ${modelName}`,
      ip_origen: req.ip || req.headers['x-forwarded-for'] || null
    });
  } catch (e) {
    // Don't block main flow if bitacora fails
    logger.error('Error registrando bitacora', e);
  }
};

// Permission checker based on Permiso / Objeto / Rol
const checkPermission = async (req, action, modelName) => {
  try {
    // If no user or no permiso model, allow by default (fallback)
    if (!req.user || !models.Permiso || !models.Objeto) return true;

    // Find objeto
    const obj = await models.Objeto.findOne({ where: { atr_objeto: modelName } })
      || await models.Objeto.findOne({ where: { atr_objeto: modelName.toUpperCase() } });
    if (!obj) return false;

    const permiso = await models.Permiso.findOne({ where: { atr_id_rol: req.user.atr_id_rol, atr_id_objeto: obj.atr_id_objetos } });
    if (!permiso) return false;

    switch ((action || '').toUpperCase()) {
      case 'CREATE': return !!permiso.atr_permiso_insercion;
      case 'READ': return !!permiso.atr_permiso_consultar;
      case 'UPDATE': return !!permiso.atr_permiso_actualizacion;
      case 'DELETE': return !!permiso.atr_permiso_eliminacion;
      default: return false;
    }
  } catch (e) {
    logger.error('Error verificando permiso', e);
    return false;
  }
};

// Return available models grouped for frontend (sistemas / catalogos)
const modelsList = async (req, res) => {
  try {
    const all = Object.keys(models || {});
    // Prefer a curated list for catalogos
    const catalogosSet = new Set(['Parametro','Rol','Permiso','Objeto','Producto','TipoCita','EstadoCita','EstadoRecordatorio','TipoMedico','Especialidad']);
    const catalogos = all.filter(a => catalogosSet.has(a));
    const sistemas = all.filter(a => !catalogosSet.has(a));
    return ResponseService.success(res, { sistemas, catalogos });
  } catch (e) {
    logger.error('Error listando modelos', e);
    return ResponseService.internalError(res, 'Error interno');
  }
};

/**
 * Helper: get Sequelize model by name (case-insensitive)
 */
const getModel = (name) => {
  if (!name) return null;
  const key = Object.keys(models).find(k => k.toLowerCase() === name.toLowerCase());
  return key ? models[key] : null;
};

/**
 * List with pagination and simple search
 */
const list = async (req, res) => {
  try {
    const { model } = req.params;
    const Model = getModel(model);
    if (!Model) return ResponseService.notFound(res, 'Modelo no encontrado');

    // Permission check: READ
    const hasPerm = await checkPermission(req, 'READ', model);
    if (!hasPerm) return ResponseService.forbidden(res, 'No tienes permisos para consultar este recurso');

    let { page = 1, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 0;

    // If limit not provided, try to read Parametro ADMIN_NUM_REGISTROS
    if (!limit || limit <= 0) {
      if (models.Parametro) {
        const p = await models.Parametro.findOne({ where: { atr_parametro: 'ADMIN_NUM_REGISTROS' } });
        if (p) limit = parseInt(p.atr_valor) || 10;
      }
      if (!limit || limit <= 0) limit = 10;
    }

    const offset = (page - 1) * limit;

    // Build where from simple query param `q` (search across string fields)
    const { q } = req.query;
    const where = {};
    if (q) {
      // Simple implementation: search first STRING attributes
      const attrs = Object.keys(Model.rawAttributes).filter(a => {
        const t = Model.rawAttributes[a].type && Model.rawAttributes[a].type.key;
        return t && t.toLowerCase().includes('string');
      });
      if (attrs.length > 0) {
        // Sequelize OR conditions
        const { Op } = require('sequelize');
        where[Op.or] = attrs.map(a => ({ [a]: { [Op.like]: `%${q}%` } }));
      }
    }

    const { count, rows } = await Model.findAndCountAll({ where, limit, offset });
    return ResponseService.paginated(res, rows, page, limit, count);
  } catch (error) {
    logger.error('Error listado mantenimiento', error);
    return ResponseService.internalError(res, 'Error interno');
  }
};

const meta = async (req, res) => {
  try {
    const { model } = req.params;
    const Model = getModel(model);
    if (!Model) return ResponseService.notFound(res, 'Modelo no encontrado');

    // Return a simplified metadata object of attributes
    const attrs = Model.rawAttributes || {};
    const meta = Object.keys(attrs).map(k => ({
      name: k,
      allowNull: !!attrs[k].allowNull,
      primaryKey: !!attrs[k].primaryKey,
      unique: !!attrs[k].unique,
      type: attrs[k].type && attrs[k].type.key ? attrs[k].type.key : String,
      // length best-effort
      length: attrs[k].type && (attrs[k].type._length || (attrs[k].type.options && attrs[k].type.options.length))
    }));

    // Determine primary key attributes order explicitly when possible
    const pkAttrs = (Model.primaryKeyAttributes && Model.primaryKeyAttributes.length)
      ? Model.primaryKeyAttributes
      : Object.keys(Model.rawAttributes).filter(k => Model.rawAttributes[k].primaryKey);

    // Return attributes along with explicit primaryKeyAttributes to help the frontend
    return ResponseService.success(res, { attributes: meta, primaryKeyAttributes: pkAttrs });
  } catch (error) {
    logger.error('Error obteniendo metadata', error);
    return ResponseService.internalError(res, 'Error interno');
  }
};

const getById = async (req, res) => {
  try {
    // ids can be single segment (old style) or multiple segments joined by '/'
    const { model } = req.params;
    const idsRaw = req.params.id || req.params.ids; // compatibility
    const Model = getModel(model);
    if (!Model) return ResponseService.notFound(res, 'Modelo no encontrado');

    const hasPerm = await checkPermission(req, 'READ', model);
    if (!hasPerm) return ResponseService.forbidden(res, 'No tienes permisos para consultar este recurso');

    // Resolve primary key attribute names
    const pkAttrs = (Model.primaryKeyAttributes && Model.primaryKeyAttributes.length) ? Model.primaryKeyAttributes
      : Object.keys(Model.rawAttributes).filter(k => Model.rawAttributes[k].primaryKey);

    let instance = null;
    if (!idsRaw) {
      return ResponseService.error(res, 'Falta identificador', 400);
    }

    const ids = (Array.isArray(idsRaw) ? idsRaw : String(idsRaw).split('/')).filter(s => s !== '');

    if (pkAttrs.length === 1) {
      // single PK
      instance = await Model.findByPk(ids[0]);
    } else {
      // composite: build where by mapping pkAttrs order to path segments
      if (ids.length < pkAttrs.length) return ResponseService.error(res, 'Identificadores incompletos', 400);
      const where = {};
      pkAttrs.forEach((attr, idx) => { where[attr] = ids[idx]; });
      instance = await Model.findOne({ where });
    }

    if (!instance) return ResponseService.notFound(res, 'Registro no encontrado');
    return ResponseService.success(res, instance);
  } catch (error) {
    logger.error('Error getById mantenimiento', error);
    return ResponseService.internalError(res, 'Error interno');
  }
};

/**
 * Basic server-side validation using model.rawAttributes
 */
const validatePayload = async (Model, payload, id = null) => {
  const errors = [];
  const attrs = Model.rawAttributes;
  for (const key of Object.keys(attrs)) {
    const meta = attrs[key];
    // skip autoIncrement primary keys and timestamps
    if (meta._autoGenerated || meta.primaryKey) continue;
    const val = payload[key];

    // Required
    if (meta.allowNull === false && (val === undefined || val === null || val === '')) {
      errors.push({ field: key, message: 'Campo requerido' });
      continue;
    }

    if (val === undefined || val === null) continue;

    // Length check for strings (best-effort)
    const typeKey = meta.type && meta.type.key ? meta.type.key.toLowerCase() : '';
    if (typeKey.includes('string') && typeof val === 'string') {
      const maxLen = meta.type._length || (meta.type.options && meta.type.options.length) || 255;
      if (val.length > maxLen) {
        errors.push({ field: key, message: `Máximo ${maxLen} caracteres` });
      }
    }

    // Uniqueness check
    if (meta.unique) {
      const where = { [key]: val };
      if (id) where[Model.primaryKeyAttribute] = { $ne: id };
      // Using findOne
      const existing = await Model.findOne({ where });
      if (existing) errors.push({ field: key, message: 'Valor duplicado' });
    }
  }
  return errors;
};

const create = async (req, res) => {
  try {
    const { model } = req.params;
    const Model = getModel(model);
    if (!Model) return ResponseService.notFound(res, 'Modelo no encontrado');

    const hasPerm = await checkPermission(req, 'CREATE', model);
    if (!hasPerm) return ResponseService.forbidden(res, 'No tienes permisos para crear este recurso');

    const payload = req.body || {};
    const validationErrors = await validatePayload(Model, payload);
    if (validationErrors.length > 0) return ResponseService.error(res, 'Validación fallida', 422, validationErrors);

    const created = await Model.create(payload);
    // Registrar en bitacora
    await recordBitacora(req, 'CREATE', `Creado registro ${Model.name} id=${created[Model.primaryKeyAttribute] || created.atr_id || created.id || ''}`, model);
    return ResponseService.success(res, created, 'Creado correctamente', 201);
  } catch (error) {
    logger.error('Error crear mantenimiento', error);
    return ResponseService.internalError(res, 'Error interno');
  }
};

const update = async (req, res) => {
  try {
  const { model } = req.params;
  const idsRaw = req.params.id || req.params.ids;
  const Model = getModel(model);
  if (!Model) return ResponseService.notFound(res, 'Modelo no encontrado');

    const hasPerm = await checkPermission(req, 'UPDATE', model);
    if (!hasPerm) return ResponseService.forbidden(res, 'No tienes permisos para actualizar este recurso');

    // Resolve primary key attribute names
    const pkAttrs = (Model.primaryKeyAttributes && Model.primaryKeyAttributes.length) ? Model.primaryKeyAttributes
      : Object.keys(Model.rawAttributes).filter(k => Model.rawAttributes[k].primaryKey);

    // find instance by PK(s)
    let instance = null;
    if (!idsRaw) return ResponseService.error(res, 'Falta identificador', 400);
    const ids = (Array.isArray(idsRaw) ? idsRaw : String(idsRaw).split('/')).filter(s => s !== '');
    if (pkAttrs.length === 1) {
      instance = await Model.findByPk(ids[0]);
    } else {
      if (ids.length < pkAttrs.length) return ResponseService.error(res, 'Identificadores incompletos', 400);
      const where = {}; pkAttrs.forEach((attr, idx) => { where[attr] = ids[idx]; });
      instance = await Model.findOne({ where });
    }
    if (!instance) return ResponseService.notFound(res, 'Registro no encontrado');

    const payload = req.body || {};
    const validationErrors = await validatePayload(Model, payload, id);
    if (validationErrors.length > 0) return ResponseService.error(res, 'Validación fallida', 422, validationErrors);

    await instance.update(payload);
      // Registrar en bitacora
      await recordBitacora(req, 'UPDATE', `Actualizado registro ${Model.name} id=${id}`, model);
    return ResponseService.success(res, instance, 'Actualizado correctamente');
  } catch (error) {
    logger.error('Error update mantenimiento', error);
    return ResponseService.internalError(res, 'Error interno');
  }
};

const remove = async (req, res) => {
  try {
  const { model } = req.params;
  const idsRaw = req.params.id || req.params.ids;
  const Model = getModel(model);
  if (!Model) return ResponseService.notFound(res, 'Modelo no encontrado');

    const hasPerm = await checkPermission(req, 'DELETE', model);
    if (!hasPerm) return ResponseService.forbidden(res, 'No tienes permisos para eliminar este recurso');

    // Resolve primary key attribute names
    const pkAttrs = (Model.primaryKeyAttributes && Model.primaryKeyAttributes.length) ? Model.primaryKeyAttributes
      : Object.keys(Model.rawAttributes).filter(k => Model.rawAttributes[k].primaryKey);

    if (!idsRaw) return ResponseService.error(res, 'Falta identificador', 400);
    const ids = (Array.isArray(idsRaw) ? idsRaw : String(idsRaw).split('/')).filter(s => s !== '');
    let instance = null;
    if (pkAttrs.length === 1) instance = await Model.findByPk(ids[0]);
    else {
      if (ids.length < pkAttrs.length) return ResponseService.error(res, 'Identificadores incompletos', 400);
      const where = {}; pkAttrs.forEach((attr, idx) => { where[attr] = ids[idx]; });
      instance = await Model.findOne({ where });
    }

    if (!instance) return ResponseService.notFound(res, 'Registro no encontrado');

    await instance.destroy();
    // Registrar en bitacora
    await recordBitacora(req, 'DELETE', `Eliminado registro ${Model.name} id=${ids.join('/')}`, model);
    return ResponseService.success(res, null, 'Eliminado correctamente');
  } catch (error) {
    logger.error('Error delete mantenimiento', error);
    return ResponseService.internalError(res, 'Error interno');
  }
};

  const exportData = async (req, res) => {
    try {
      const { model } = req.params;
      const Model = getModel(model);
      if (!Model) return ResponseService.notFound(res, 'Modelo no encontrado');

      // Simple CSV export (all rows, consider adding filters later)
      const rows = await Model.findAll();
      if (!rows || rows.length === 0) return ResponseService.success(res, [], 'No hay datos para exportar');

      const fields = Object.keys(Model.rawAttributes);
      // Build CSV
      const escape = (v) => {
        if (v === null || v === undefined) return '';
        const s = String(typeof v === 'object' ? JSON.stringify(v) : v);
        return '"' + s.replace(/"/g, '""') + '"';
      };

      const header = fields.join(',');
      const lines = rows.map(r => fields.map(f => escape(r.get(f))).join(','));
      const csv = [header].concat(lines).join('\n');

      const format = (req.query.format || 'csv').toLowerCase();
      if (format === 'pdf') {
        // Lazy require for pdfkit
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'portrait' });
        res.setHeader('Content-Disposition', `attachment; filename=${model}_export.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        // Pipe PDF to response
        doc.pipe(res);

        // Title
        doc.fontSize(16).text(`${model} - Export`, { align: 'center' });
        doc.moveDown(1);

        // Prepare a simple table: header row then rows (truncate long fields)
        const maxCols = Math.min(fields.length, 8);
        const cols = fields.slice(0, maxCols);

        // Header
        doc.fontSize(10).font('Helvetica-Bold');
        cols.forEach((c, i) => {
          doc.text(c, { continued: i < cols.length - 1 });
        });
        doc.moveDown(0.5);

        // Rows
        doc.font('Helvetica').fontSize(9);
        rows.forEach(r => {
          cols.forEach((c, i) => {
            let v = r.get(c);
            if (v === null || v === undefined) v = '';
            if (typeof v === 'object') v = JSON.stringify(v);
            v = String(v).replace(/\s+/g, ' ').trim();
            // Truncate to avoid overflow
            if (v.length > 80) v = v.substring(0, 77) + '...';
            doc.text(v, { continued: i < cols.length - 1 });
          });
          doc.moveDown(0.3);
        });

        doc.end();
        return; // response will be the PDF stream
      }

      res.setHeader('Content-Disposition', `attachment; filename=${model}_export.csv`);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      return res.send(csv);
    } catch (error) {
      logger.error('Error export mantenimiento', error);
      return ResponseService.internalError(res, 'Error interno');
    }
  };

  // Return permisos para el modelo/objeto actual del usuario
  const getPermissions = async (req, res) => {
    try {
      const { model } = req.params;
      if (!req.user) return ResponseService.unauthorized(res, 'Autenticación requerida');
      if (!models.Objeto || !models.Permiso) return ResponseService.internalError(res, 'Módulos de permisos no disponibles');

      // buscar objeto por nombre (intentar variantes)
      const nameVariants = [model, model.toUpperCase(), model.toLowerCase(), model.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '')];
      let obj = null;
      for (const n of nameVariants) {
        obj = await models.Objeto.findOne({ where: { atr_objeto: n } });
        if (obj) break;
      }
      if (!obj) return ResponseService.notFound(res, 'Objeto no encontrado');

      const permiso = await models.Permiso.findOne({ where: { atr_id_rol: req.user.atr_id_rol, atr_id_objeto: obj.atr_id_objetos } });
      if (!permiso) return ResponseService.success(res, { create: false, read: false, update: false, delete: false });

      return ResponseService.success(res, {
        create: !!permiso.atr_permiso_insercion,
        read: !!permiso.atr_permiso_consultar,
        update: !!permiso.atr_permiso_actualizacion,
        delete: !!permiso.atr_permiso_eliminacion
      });
    } catch (e) {
      logger.error('Error obteniendo permisos', e);
      return ResponseService.internalError(res, 'Error interno');
    }
  };

    // Async uniqueness check used by frontend validators
    const unique = async (req, res) => {
      try {
        const { model } = req.params;
        const { field, value, id } = req.query;
        const Model = getModel(model);
        if (!Model) return ResponseService.notFound(res, 'Modelo no encontrado');
        if (!field) return ResponseService.error(res, 'Falta campo `field`', 400);
        // Ensure attribute exists
        const attrs = Model.rawAttributes || {};
        if (!Object.prototype.hasOwnProperty.call(attrs, field)) return ResponseService.error(res, 'Campo no existe en el modelo', 400);

        const where = { [field]: value };
        // exclude id if provided
        if (id) {
          const pk = Model.primaryKeyAttribute || 'id';
          where[pk] = { [require('sequelize').Op.ne]: id };
        }

        const existing = await Model.findOne({ where });
        const exists = !!existing;
        return ResponseService.success(res, { unique: !exists, exists });
      } catch (e) {
        logger.error('Error uniqueness check', e);
        return ResponseService.internalError(res, 'Error interno');
      }
    };

module.exports = {
  list,
  meta,
  getById,
  create,
  update,
  remove
  , export: exportData,
  modelsList,
  getPermissions,
  unique
};

