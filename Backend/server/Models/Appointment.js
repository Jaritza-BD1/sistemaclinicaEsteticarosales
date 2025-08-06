// server/Models/Appointment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db'); // Asegúrate de la ruta correcta a tu configuración de Sequelize

const Appointment = sequelize.define('tbl_reserva_cita', {
  atr_id_cita: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'atr_id_cita' // Nombre real de la columna en la BD
  },
  atr_id_paciente: {
    type: DataTypes.INTEGER,
    field: 'atr_id_paciente'
  },
  atr_id_medico: {
    type: DataTypes.INTEGER,
    field: 'atr_id_medico'
  },
  atr_id_usuario: {
    type: DataTypes.INTEGER,
    field: 'atr_id_usuario'
  },
  atr_fecha_cita: {
    type: DataTypes.DATEONLY, // Solo fecha
    field: 'atr_fecha_cita'
  },
  atr_hora_cita: {
    type: DataTypes.TIME, // Solo hora
    field: 'atr_hora_cita'
  },
  atr_motivo_cita: {
    type: DataTypes.STRING(255),
    field: 'atr_motivo_cita'
  },
  atr_id_tipo_cita: {
    type: DataTypes.INTEGER,
    field: 'atr_id_tipo_cita'
  },
  atr_id_estado: {
    type: DataTypes.INTEGER,
    field: 'atr_id_estado'
  },
  // Sequelize añade createdAt y updatedAt por defecto, si no los quieres, desactívalos
  // timestamps: false,
}, {
  tableName: 'tbl_reserva_cita',
  timestamps: false // Si no tienes createdAt/updatedAt en tu tabla SQL
});

// Define la relación si ya tienes el modelo Recordatorio
const Recordatorio = require('./Recordatorio');
Appointment.hasOne(Recordatorio, { foreignKey: 'atr_id_cita', as: 'Recordatorio' });

module.exports = Appointment;