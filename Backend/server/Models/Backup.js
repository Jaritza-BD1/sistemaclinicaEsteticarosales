const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const Backup = sequelize.define('tbl_ms_backups', {
  atr_id_backup: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'atr_id_backup'
  },
  atr_file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'atr_file_name'
  },
  atr_file_path: {
    type: DataTypes.STRING(1024),
    allowNull: false,
    field: 'atr_file_path'
  },
  atr_size: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'atr_size'
  },
  atr_created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'atr_created_at'
  },
  atr_created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'atr_created_by'
  },
  atr_triggered_by: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'atr_triggered_by'
  }
}, {
  tableName: 'tbl_ms_backups',
  timestamps: false
});

module.exports = Backup;
