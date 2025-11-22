const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const CleanupRun = sequelize.define('CleanupRun', {
  atr_id_cleanup: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'atr_id_cleanup'
  },
  atr_ejecutado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'atr_ejecutado_por'
  },
  atr_tipo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'atr_tipo' // 'uploads' | 'trash'
  },
  atr_fecha_ejecucion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'atr_fecha_ejecucion'
  },
  atr_moved_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'atr_moved_count'
  },
  atr_deleted_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'atr_deleted_count'
  },
  atr_details: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'atr_details'
  }
}, {
  tableName: 'tbl_cleanup_runs',
  timestamps: false
});

module.exports = CleanupRun;
