// File: server/models/Recordatorio.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Recordatorio = sequelize.define('tbl_recordatorio', {
  atr_id_recordatorio: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_id_cita: { type: DataTypes.INTEGER, allowNull: false },
  atr_fecha_hora_envio: { type: DataTypes.DATE, allowNull: false },
  atr_medio: { type: DataTypes.ENUM('sms','email','notificación app'), allowNull: false },
  atr_contenido: { type: DataTypes.STRING(100), allowNull: false },
  atr_id_estado_recordatorio: { type: DataTypes.INTEGER, allowNull: false },
  atr_cancelacion: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'tbl_recordatorio', timestamps: false });
module.exports = Recordatorio;