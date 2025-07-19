// helpers/bitacoraHelper.js

// Aquí puedes dejar utilidades puntuales, por ejemplo:

/**
 * Formatea una fecha a YYYY-MM-DD (útil para filtros SQL)
 */
function formatearFecha(fecha) {
  if (!fecha) return null;
  const d = new Date(fecha);
  return d.toISOString().slice(0, 10);
}

module.exports = {
  formatearFecha
};