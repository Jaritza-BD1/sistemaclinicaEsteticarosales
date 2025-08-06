const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const DoctorPhone = sequelize.define('tbl_telefono_medico', {
  atr_id_telefono: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_id_medico: DataTypes.INTEGER,
  atr_telefono: DataTypes.STRING
}, { tableName: 'tbl_telefono_medico', timestamps: false });

module.exports = DoctorPhone; 