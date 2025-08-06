const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const PatientEmail = sequelize.define('tbl_correo_paciente', {
  atr_id_correo_p: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_id_paciente: DataTypes.INTEGER,
  atr_correo: DataTypes.STRING
}, { tableName: 'tbl_correo_paciente', timestamps: false });

module.exports = PatientEmail; 