const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const PatientPhone = sequelize.define('tbl_telefono_paciente', {
  atr_id_telefono: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_id_paciente: DataTypes.INTEGER,
  atr_telefono: DataTypes.STRING
}, { tableName: 'tbl_telefono_paciente', timestamps: false });

module.exports = PatientPhone; 