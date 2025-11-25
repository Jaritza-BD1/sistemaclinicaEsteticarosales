import api from './api';
import { throwParsedAxiosError } from './httpHelper';

// `api` client already includes the `/api` prefix in its baseURL,
// so use paths relative to that base (avoid duplicating `/api`).
const base = '/admin/maintenance';

// helper: build an id path segment which may be a primitive, array or string like '1/2'
const buildIdSegment = (id) => {
  if (id === null || typeof id === 'undefined') return '';
  if (typeof id === 'string') return id;
  if (Array.isArray(id)) return id.join('/');
  if (typeof id === 'object') {
    // attempt to join values in object (caller should provide ordered array or string when order matters)
    return Object.values(id).join('/');
  }
  return String(id);
};

// Normalize permiso payload: ensure permission flags are strings ('1' for enabled, '' for disabled)
const normalizePermisoPayload = (payload = {}) => {
  const p = { ...(payload || {}) };
  const flags = ['atr_permiso_insercion', 'atr_permiso_eliminacion', 'atr_permiso_actualizacion', 'atr_permiso_consultar'];
  flags.forEach(f => {
    const v = p[f];
    if (typeof v === 'boolean') {
      p[f] = v ? '1' : '';
    } else if (typeof v === 'string') {
      // treat any non-empty string as enabled
      p[f] = v && v.trim() !== '' ? '1' : '';
    } else if (typeof v === 'number') {
      p[f] = v ? '1' : '';
    } else {
      p[f] = '';
    }
  });
  return p;
};

export const getMeta = async (model) => {
  try {
    const res = await api.get(`${base}/${model}/meta`);
    // `res` may be either the axios response or the response.data (api interceptor returns data when possible)
    const body = res && (res.data || res);
    // Normalize response for backward compatibility. Backend now returns { attributes, primaryKeyAttributes } wrapped in `data`.
    const payload = (body && body.data) ? body.data : body;
    if (!payload) return body;
    if (payload.attributes && Array.isArray(payload.attributes)) {
      return { data: payload.attributes, primaryKeyAttributes: payload.primaryKeyAttributes || [] };
    }
    // old shape: payload is directly the attributes array
    if (Array.isArray(payload)) return { data: payload, primaryKeyAttributes: [] };
    return { data: payload, primaryKeyAttributes: [] };
  } catch (err) {
    throwParsedAxiosError(err);
  }
};

export const getModels = async () => {
  try {
    // Endpoint expected to return an object like: { sistemas: [...], catalogos: [...] }
  const res = await api.get(`${base}/models`);
  return res;
  } catch (err) { throwParsedAxiosError(err); }
};

export const list = async (model, page = 1, limit = 10, q = '', options = {}) => {
  try {
    // options may include { offset }
    const params = { page, limit, q };
    // Merge allowed options into params (offset, field, sort, etc.)
    if (options && typeof options === 'object') {
      Object.keys(options).forEach(k => {
        if (typeof options[k] !== 'undefined') params[k] = options[k];
      });
    }
  const res = await api.get(`${base}/${model}`, { params });
  return res;
  } catch (err) { throwParsedAxiosError(err); }
};

export const getById = async (model, id) => {
  try {
    const idSeg = buildIdSegment(id);
    const url = idSeg ? `${base}/${model}/${idSeg}` : `${base}/${model}`;
      const res = await api.get(url);
      return res;
  } catch (err) { throwParsedAxiosError(err); }
};

export const create = async (model, payload) => {
  try {
    // Special-case Permiso create/upsert which uses a dedicated endpoint for business logic
    if (String(model).toLowerCase() === 'permiso' || String(model).toLowerCase() === 'permisos') {
      const normalized = normalizePermisoPayload(payload);
      const res = await api.post('/permisos/upsert', normalized);
      return res;
    }
    const res = await api.post(`${base}/${model}`, payload);
    return res;
  } catch (err) { throwParsedAxiosError(err); }
};

export const update = async (model, id, payload) => {
  try {
    // Special-case Permiso: use upsert endpoint instead of generic PUT when updating permissions
    if (String(model).toLowerCase() === 'permiso' || String(model).toLowerCase() === 'permisos') {
      const normalized = normalizePermisoPayload(payload);
      const res = await api.post('/permisos/upsert', normalized);
      return res;
    }
    const idSeg = buildIdSegment(id);
    const res = await api.put(`${base}/${model}/${idSeg}`, payload);
    return res;
  } catch (err) { throwParsedAxiosError(err); }
};

export const remove = async (model, id) => {
  try {
  const idSeg = buildIdSegment(id);
  const res = await api.delete(`${base}/${model}/${idSeg}`);
  return res;
  } catch (err) { throwParsedAxiosError(err); }
};

export const checkUnique = async (model, field, value, id = null) => {
  try {
    // Calls backend endpoint to check uniqueness. Expects { unique: true/false }
    const params = { field, value };
    if (id) params.id = id;
  const res = await api.get(`${base}/${model}/unique`, { params });
  return res;
  } catch (err) { throwParsedAxiosError(err); }
};

export const exportData = async (model, format = 'csv') => {
  try {
    const url = `${base}/${model}/export`;
    // Use the shared api client so baseURL is applied; request binary blob via responseType
    const res = await api.get(url, { params: { format }, responseType: 'blob' });
    return res;
  } catch (err) { throwParsedAxiosError(err); }
};

export const getPermissions = async (model) => {
  try {
      const res = await api.get(`${base}/${model}/permissions`);
      return res;
  } catch (err) { throwParsedAxiosError(err); }
};
const maintenanceService = {
  getMeta,
  getModels,
  list,
  getById,
  create,
  update,
  remove,
  checkUnique
};

// Include additional helpers in the default export for compatibility with callers
maintenanceService.exportData = exportData;
maintenanceService.getPermissions = getPermissions;

export default maintenanceService;
