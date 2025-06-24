const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const PasswordHistory = sequelize.define('PasswordHistory', {
  atr_id_hist: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'atr_id_hist'
  },
  atr_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'atr_usuario'
  },
  atr_contrasena: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'atr_contrasena'
  },
  atr_creado_por: {
    type: DataTypes.STRING(15),
    field: 'atr_creado_por'
  },
  atr_fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'atr_fecha_creacion'
  },
  atr_modificado_por: {
    type: DataTypes.STRING(15),
    field: 'atr_modificado_por'
  },
  atr_fecha_modificacion: {
    type: DataTypes.DATE,
    field: 'atr_fecha_modificacion'
  }
}, {
  tableName: 'tbl_ms_hist_contrasena',
  timestamps: false,
  freezeTableName: true
});

module.exports = PasswordHistory;
