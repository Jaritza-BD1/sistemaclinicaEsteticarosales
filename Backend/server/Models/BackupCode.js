// Models/BackupCode.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const BackupCode = sequelize.define('tbl_ms_backup_codes', {
  atr_id_backup: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'atr_id_backup'
  },
  atr_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'atr_usuario',
    references: {
      model: 'tbl_ms_usuario',
      key: 'atr_id_usuario'
    }
  },
  atr_codigo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    field: 'atr_codigo'
  },
  atr_utilizado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'atr_utilizado'
  },
  atr_fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'atr_fecha_creacion'
  },
  atr_fecha_utilizacion: {
    type: DataTypes.DATE,
    field: 'atr_fecha_utilizacion'
  }
}, {
  tableName: 'tbl_ms_backup_codes',
  freezeTableName: true,
  timestamps: false
});

module.exports = BackupCode;