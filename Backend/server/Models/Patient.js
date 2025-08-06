const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const Patient = sequelize.define('tbl_paciente', {
  atr_id_paciente: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_nombre: DataTypes.STRING,
  atr_apellido: DataTypes.STRING,
  atr_fecha_nacimiento: DataTypes.DATEONLY,
  atr_identidad: DataTypes.STRING,
  atr_numero_expediente: DataTypes.INTEGER,
  atr_id_genero: DataTypes.INTEGER,
  atr_id_tipo_paciente: DataTypes.INTEGER
}, { tableName: 'tbl_paciente', timestamps: false });

module.exports = Patient; 