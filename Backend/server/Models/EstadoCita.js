// File: server/models/EstadoCita.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');
const EstadoCita = sequelize.define('tbl_estado_cita', {
  atr_id_estado: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_nombre_estado: { type: DataTypes.STRING(100), allowNull: false },
  atr_descripcion: { type: DataTypes.TEXT }
}, { tableName: 'tbl_estado_cita', timestamps: false });
module.exports = EstadoCita;
