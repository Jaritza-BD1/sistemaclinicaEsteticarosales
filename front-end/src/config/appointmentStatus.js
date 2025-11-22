// src/config/appointmentStatus.js
/**
 * Estados válidos para citas médicas y máquina de estados (Frontend)
 */

// Estados de cita
export const APPOINTMENT_STATUS = {
  PROGRAMADA: 'PROGRAMADA',
  CONFIRMADA: 'CONFIRMADA',
  EN_CONSULTA: 'EN_CONSULTA',
  PENDIENTE_PAGO: 'PENDIENTE_PAGO',
  FINALIZADA: 'FINALIZADA',
  CANCELADA: 'CANCELADA',
  NO_ASISTIO: 'NO_ASISTIO'
};

// Estados activos (citas que aún pueden cambiar)
export const ACTIVE_STATUSES = [
  APPOINTMENT_STATUS.PROGRAMADA,
  APPOINTMENT_STATUS.CONFIRMADA,
  APPOINTMENT_STATUS.EN_CONSULTA,
  APPOINTMENT_STATUS.PENDIENTE_PAGO
];

// Estados finales (citas terminadas)
export const FINAL_STATUSES = [
  APPOINTMENT_STATUS.FINALIZADA,
  APPOINTMENT_STATUS.CANCELADA,
  APPOINTMENT_STATUS.NO_ASISTIO
];

// Máquina de estados - transiciones válidas
export const STATUS_TRANSITIONS = {
  [APPOINTMENT_STATUS.PROGRAMADA]: [
    APPOINTMENT_STATUS.CONFIRMADA,
    APPOINTMENT_STATUS.EN_CONSULTA,  // Permitir iniciar consulta directamente
    APPOINTMENT_STATUS.CANCELADA,
    APPOINTMENT_STATUS.NO_ASISTIO
  ],
  [APPOINTMENT_STATUS.CONFIRMADA]: [
    APPOINTMENT_STATUS.EN_CONSULTA,
    APPOINTMENT_STATUS.CANCELADA,
    APPOINTMENT_STATUS.NO_ASISTIO
  ],
  [APPOINTMENT_STATUS.EN_CONSULTA]: [
    APPOINTMENT_STATUS.PENDIENTE_PAGO,
    APPOINTMENT_STATUS.FINALIZADA
  ],
  [APPOINTMENT_STATUS.PENDIENTE_PAGO]: [
    APPOINTMENT_STATUS.FINALIZADA
  ],
  [APPOINTMENT_STATUS.FINALIZADA]: [], // Estado final
  [APPOINTMENT_STATUS.CANCELADA]: [], // Estado final
  [APPOINTMENT_STATUS.NO_ASISTIO]: [] // Estado final
};

// Funciones helper
export const isValidStatus = (status) => {
  return Object.values(APPOINTMENT_STATUS).includes(status);
};

export const isActiveStatus = (status) => {
  return ACTIVE_STATUSES.includes(status);
};

export const isFinalStatus = (status) => {
  return FINAL_STATUSES.includes(status);
};

export const canTransitionTo = (currentStatus, newStatus) => {
  if (!isValidStatus(currentStatus) || !isValidStatus(newStatus)) {
    return false;
  }

  // Si es el mismo estado, permitir (no cambia nada)
  if (currentStatus === newStatus) {
    return true;
  }

  return STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
};

export const getValidTransitions = (currentStatus) => {
  if (!isValidStatus(currentStatus)) {
    return [];
  }
  return STATUS_TRANSITIONS[currentStatus] || [];
};

export const getStatusLabel = (status) => {
  const labels = {
    [APPOINTMENT_STATUS.PROGRAMADA]: 'Programada',
    [APPOINTMENT_STATUS.CONFIRMADA]: 'Confirmada',
    [APPOINTMENT_STATUS.EN_CONSULTA]: 'En Consulta',
    [APPOINTMENT_STATUS.PENDIENTE_PAGO]: 'Pendiente de Pago',
    [APPOINTMENT_STATUS.FINALIZADA]: 'Finalizada',
    [APPOINTMENT_STATUS.CANCELADA]: 'Cancelada',
    [APPOINTMENT_STATUS.NO_ASISTIO]: 'No Asistió'
  };
  return labels[status] || status;
};

export const getStatusColor = (status) => {
  const colors = {
    [APPOINTMENT_STATUS.PROGRAMADA]: 'warning',
    [APPOINTMENT_STATUS.CONFIRMADA]: 'info',
    [APPOINTMENT_STATUS.EN_CONSULTA]: 'primary',
    [APPOINTMENT_STATUS.PENDIENTE_PAGO]: 'secondary',
    [APPOINTMENT_STATUS.FINALIZADA]: 'success',
    [APPOINTMENT_STATUS.CANCELADA]: 'error',
    [APPOINTMENT_STATUS.NO_ASISTIO]: 'error'
  };
  return colors[status] || 'default';
};

// Mapeo de IDs a nombres (para compatibilidad con backend)
export const STATUS_ID_MAP = {
  1: APPOINTMENT_STATUS.PROGRAMADA,
  2: APPOINTMENT_STATUS.CONFIRMADA,
  3: APPOINTMENT_STATUS.EN_CONSULTA,
  4: APPOINTMENT_STATUS.PENDIENTE_PAGO,
  5: APPOINTMENT_STATUS.FINALIZADA,
  6: APPOINTMENT_STATUS.CANCELADA,
  7: APPOINTMENT_STATUS.NO_ASISTIO
};

export const getStatusNameById = (id) => {
  return STATUS_ID_MAP[id] || null;
};