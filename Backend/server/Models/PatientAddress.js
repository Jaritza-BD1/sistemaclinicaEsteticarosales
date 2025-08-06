const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const PatientAddress = sequelize.define('tbl_direccion_paciente', {
  atr_id_direccion_p: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_id_paciente: DataTypes.INTEGER,
  atr_direccion_completa: DataTypes.STRING
}, { tableName: 'tbl_direccion_paciente', timestamps: false });

module.exports = PatientAddress; 