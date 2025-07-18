// File: server/models/EstadoCita.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const EstadoCita = sequelize.define('tbl_estado_cita', {
  atr_id_estado: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_estado: { type: DataTypes.BOOLEAN, allowNull: false },
  atr_observacion: { type: DataTypes.TEXT }
}, { tableName: 'tbl_estado_cita', timestamps: false });
module.exports = EstadoCita;
