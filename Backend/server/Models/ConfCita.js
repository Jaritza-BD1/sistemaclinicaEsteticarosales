// File: server/Models/ConfCita.js
const { DataTypes } = require('sequelize');
const sequelize = require('../Config/database');

const ConfCita = sequelize.define('tbl_conf_cita', {
  atr_id_conf_cita: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  atr_id_cita: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  atr_fecha_hora_confirmacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  atr_medio: {
    type: DataTypes.ENUM('llamada', 'WhatsApp', 'email', 'otro'),
    allowNull: false
  },
  atr_confirmado_por: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  atr_notas: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'tbl_conf_cita',
  timestamps: false
});

module.exports = ConfCita;