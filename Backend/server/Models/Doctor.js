const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const Doctor = sequelize.define('tbl_medico', {
  atr_id_medico: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_nombre: { type: DataTypes.STRING(255), allowNull: false },
  atr_apellido: { type: DataTypes.STRING(255), allowNull: false },
  atr_fecha_nacimiento: { type: DataTypes.DATEONLY, allowNull: true },
  atr_identidad: { type: DataTypes.STRING(20), allowNull: true },
  atr_id_genero: { type: DataTypes.INTEGER, allowNull: true },
  atr_id_tipo_medico: { type: DataTypes.INTEGER, allowNull: true },
  atr_numero_colegiado: { type: DataTypes.STRING(15), allowNull: true },
  atr_creado_por: { type: DataTypes.INTEGER, allowNull: true },
  atr_fecha_creacion: { type: DataTypes.DATE, allowNull: true },
  atr_fecha_actualizacion: { type: DataTypes.DATE, allowNull: true }
}, { tableName: 'tbl_medico', timestamps: false });

module.exports = Doctor; 