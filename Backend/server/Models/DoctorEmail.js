const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const DoctorEmail = sequelize.define('tbl_correo_medico', {
  atr_id_correo_m: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_id_medico: DataTypes.INTEGER,
  atr_correo: DataTypes.STRING
}, { tableName: 'tbl_correo_medico', timestamps: false });

module.exports = DoctorEmail; 