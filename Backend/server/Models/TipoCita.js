// File: server/models/TipoCita.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');
const TipoCita = sequelize.define('tbl_tipo_cita', {
  atr_id_tipo_cita: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_nombre_tipo_cita: { type: DataTypes.STRING(100), allowNull: false },
  // Nuevo campo para indicar el área a la que pertenece el tipo de cita
  // Valores recomendados: 'PODOLOGICA' o 'ESTETICA'
  atr_area: { type: DataTypes.ENUM('PODOLOGICA', 'ESTETICA'), allowNull: false, defaultValue: 'ESTETICA' }
}, { tableName: 'tbl_tipo_cita', timestamps: false });
module.exports = TipoCita;