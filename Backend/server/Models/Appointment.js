// server/Models/Appointment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const Appointment = sequelize.define('Appointment', {
  atr_id_cita: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'atr_id_cita'
  },
  atr_id_paciente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'atr_id_paciente'
  },
  atr_id_medico: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'atr_id_medico'
  },
  atr_id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'atr_id_usuario'
  },
  atr_fecha_cita: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'atr_fecha_cita'
  },
  atr_hora_cita: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'atr_hora_cita'
  },
  atr_motivo_cita: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'atr_motivo_cita'
  },
  atr_id_tipo_cita: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'atr_id_tipo_cita'
  },
  atr_id_estado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'atr_id_estado'
  },
  atr_duracion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    field: 'atr_duracion',
    comment: 'Duración de la cita en minutos'
  },
  // Campo opcional para check-in (hora de llegada real)
  atr_fecha_hora_checkin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'atr_fecha_hora_checkin',
    comment: 'Fecha y hora real de llegada del paciente (check-in)'
  }
}, {
  tableName: 'tbl_reserva_cita',
  timestamps: true, // createdAt, updatedAt
  comment: 'Tabla de reservas de citas médicas'
});

// Asociaciones centralizadas en `Models/index.js`
// (moved there to avoid circular requires and centralize relationship definitions)

module.exports = Appointment;