// File: server/models/EstadoRecordatorio.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');
const EstadoRecordatorio = sequelize.define('tbl_estado_bitacora_recordatorio', {
  atr_id_estado_recordatorio: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_estado_recordatorio: { type: DataTypes.STRING(50), allowNull: false }
}, { tableName: 'tbl_estado_bitacora_recordatorio', timestamps: false });
module.exports = EstadoRecordatorio;