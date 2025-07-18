// File: server/models/Appointment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Appointment = sequelize.define('tbl_reserva_cita', {
  atr_id_cita: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_id_paciente: { type: DataTypes.INTEGER, allowNull: false },
  atr_id_medico: { type: DataTypes.INTEGER, allowNull: false },
  atr_id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  atr_fecha_cita: { type: DataTypes.DATEONLY, allowNull: false },
  atr_hora_cita: { type: DataTypes.TIME, allowNull: false },
  atr_motivo_cita: { type: DataTypes.TEXT, allowNull: false },
  atr_id_tipo_cita: { type: DataTypes.INTEGER, allowNull: false },
  atr_id_estado: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }
}, { tableName: 'tbl_reserva_cita', timestamps: false });
module.exports = Appointment;