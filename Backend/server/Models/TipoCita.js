// File: server/models/TipoCita.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const TipoCita = sequelize.define('tbl_tipo_cita', {
  atr_id_tipo_cita: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_nombre_tipo_cita: { type: DataTypes.STRING(100), allowNull: false }
}, { tableName: 'tbl_tipo_cita', timestamps: false });
module.exports = TipoCita;