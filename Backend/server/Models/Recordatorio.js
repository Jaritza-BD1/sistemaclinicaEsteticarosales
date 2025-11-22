// File: server/models/Recordatorio.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');
const Recordatorio = sequelize.define('tbl_recordatorio', {
  atr_id_recordatorio: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_id_cita: { type: DataTypes.INTEGER, allowNull: false },
  atr_fecha_hora_envio: { type: DataTypes.DATE, allowNull: false },
  atr_medio: { type: DataTypes.ENUM('sms','email','notificación app'), allowNull: false }
}, { tableName: 'tbl_recordatorio', timestamps: false });

// Associations
// Moved to Models/index.js to centralize

module.exports = Recordatorio;