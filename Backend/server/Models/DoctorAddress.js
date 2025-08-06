const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const DoctorAddress = sequelize.define('tbl_direccion_medico', {
  atr_id_direccion_m: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_id_medico: DataTypes.INTEGER,
  atr_direccion_completa: DataTypes.STRING
}, { tableName: 'tbl_direccion_medico', timestamps: false });

module.exports = DoctorAddress; 