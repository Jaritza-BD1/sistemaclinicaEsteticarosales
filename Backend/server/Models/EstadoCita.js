// File: server/models/EstadoCita.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');
const EstadoCita = sequelize.define('tbl_estado_cita', {
  atr_id_estado: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, field: 'atr_id_estado' },
  // Map JS attribute `atr_nombre_estado` to actual DB column `atr_estado`
  atr_nombre_estado: { type: DataTypes.STRING(100), allowNull: false, field: 'atr_estado' },
  // Map JS attribute `atr_descripcion` to actual DB column `atr_observacion`
  atr_descripcion: { type: DataTypes.TEXT, field: 'atr_observacion' }
}, { tableName: 'tbl_estado_cita', timestamps: false });
module.exports = EstadoCita;
