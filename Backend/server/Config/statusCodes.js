// config/statusCodes.js
/**
 * Códigos de estado que apuntan a IDs reales en la base de datos
 * Estos IDs deben coincidir con los de la tabla tbl_estado_cita
 */

const CITA_ESTADOS = {
  PROGRAMADA: 1,
  CONFIRMADA: 2,
  EN_CONSULTA: 3,  // Nota: En el seeder es EN_CONSULTA pero en appointmentStatus es EN_CONSULTA
  PENDIENTE_PAGO: 4,
  FINALIZADA: 5,
  CANCELADA: 6,
  NO_ASISTIO: 7,
};

// Alias para mantener compatibilidad
const CITA_ESTADOS_ALIAS = {
  EN_CURSO: CITA_ESTADOS.EN_CONSULTA,  // Alias para EN_CONSULTA
};

// Mapeo inverso: ID -> Nombre de estado
const ESTADO_ID_MAP = {
  1: 'PROGRAMADA',
  2: 'CONFIRMADA',
  3: 'EN_CONSULTA',
  4: 'PENDIENTE_PAGO',
  5: 'FINALIZADA',
  6: 'CANCELADA',
  7: 'NO_ASISTIO'
};

const getEstadoNombreById = (id) => {
  return ESTADO_ID_MAP[id] || null;
};

const getEstadoIdByNombre = (nombre) => {
  const idMap = Object.entries(CITA_ESTADOS).find(([key, value]) => key === nombre);
  return idMap ? idMap[1] : null;
};

module.exports = {
  CITA_ESTADOS,
  CITA_ESTADOS_ALIAS,
  ESTADO_ID_MAP,
  getEstadoNombreById,
  getEstadoIdByNombre
};