// Utility to compute a deterministic row id for DataGrid and other uses.
// Accepts an optional array of primary key attribute names to build composite ids.
export function getRowId(row = {}, primaryKeyAttributes = []) {
  if (!row) return '';
  // If PK attributes provided, join them in order (useful for composite keys)
  if (Array.isArray(primaryKeyAttributes) && primaryKeyAttributes.length > 0) {
    const parts = primaryKeyAttributes.map(k => {
      const v = row[k];
      return (typeof v === 'undefined' || v === null) ? '' : String(v);
    });
    const composite = parts.filter(p => p !== '').join('/');
    if (composite) return composite;
  }

  // Common single-id fallbacks used across the codebase
  const candidates = ['id', 'atr_id_usuario', 'atr_id_objetos', 'atr_id_paciente', 'atr_id_medico', 'atr_id_productos', 'atr_id_rol', 'atr_id'];
  for (let c of candidates) {
    if (typeof row[c] !== 'undefined' && row[c] !== null) return String(row[c]);
  }

  // As a last resort, use a JSON stable-ish string (not ideal but deterministic per object content)
  try { return JSON.stringify(row); } catch (e) { return '' + Math.random(); }
}

export default getRowId;
