const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const Doctor = sequelize.define('tbl_medico', {
  atr_id_medico: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_nombre: DataTypes.STRING,
  atr_apellido: DataTypes.STRING,
  atr_fecha_nacimiento: DataTypes.DATEONLY,
  atr_identidad: DataTypes.STRING,
  atr_id_genero: DataTypes.INTEGER,
  atr_id_tipo_medico: DataTypes.INTEGER
}, { tableName: 'tbl_medico', timestamps: false });

module.exports = Doctor; 