const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const ReprogramarCita = sequelize.define('ReprogramarCita', {
  atr_id_reprogramacion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'atr_id_reprogramacion'
  },
  atr_id_cita: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'atr_id_cita'
  },
  atr_fecha_anterior: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'atr_fecha_anterior'
  },
  atr_hora_anterior: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'atr_hora_anterior'
  },
  atr_nueva_fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'atr_nueva_fecha'
  },
  atr_nueva_hora: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'atr_nueva_hora'
  },
  atr_motivo_reprogramacion: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'atr_motivo_reprogramacion'
  },
  atr_estado_reprogramacion: {
    type: DataTypes.ENUM('APROBADA', 'PENDIENTE', 'CANCELADA'),
    allowNull: false,
    defaultValue: 'APROBADA',
    field: 'atr_estado_reprogramacion'
  },
  atr_fecha_reprogramacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'atr_fecha_reprogramacion'
  },
  atr_id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'atr_id_usuario'
  }
}, {
  tableName: 'tbl_reprogramar_cita',
  timestamps: false
});

module.exports = ReprogramarCita;