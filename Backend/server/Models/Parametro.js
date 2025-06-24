//backend/src/models/parametro.model.js
const { DataTypes } = require('sequelize');
const db = require('../Config/db');

const Parametro = db.define('tbl_ms_parametros', {
  atr_id_parametro: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  atr_parametro: { type: DataTypes.STRING(50), allowNull: false },
  atr_valor: { type: DataTypes.STRING(100), allowNull: false },
  atr_id_usuario: { type: DataTypes.INTEGER },
  atr_creado_por: { type: DataTypes.STRING(15) },
  atr_fecha_creacion: { type: DataTypes.DATE },
  atr_modificado_por: { type: DataTypes.STRING(15) },
  atr_fecha_modificacion: { type: DataTypes.DATE },
}, {
  timestamps: false,
  tableName: 'tbl_ms_parametros',
});

module.exports = Parametro;
