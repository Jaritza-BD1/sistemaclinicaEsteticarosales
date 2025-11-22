// models/EstadoBitacoraRecordatorio.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');

const EstadoBitacoraRecordatorio = sequelize.define('tbl_estado_bitacora_recordatorio', {
  atr_id_estado_recordatorio: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_id_recordatorio:        { type: DataTypes.INTEGER, allowNull: false }, // FK REAL
  atr_estado_recordatorio:    { type: DataTypes.STRING(50), allowNull: false },
  atr_contenido:              { type: DataTypes.STRING(100), allowNull: true },
  atr_cancelacion:            { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'tbl_estado_bitacora_recordatorio',
  timestamps: false
});

module.exports = EstadoBitacoraRecordatorio;