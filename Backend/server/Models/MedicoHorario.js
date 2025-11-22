const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const MedicoHorario = sequelize.define('MedicoHorario', {
  atr_id_horario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'atr_id_horario'
  },
  atr_id_medico: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'atr_id_medico'
  },
  atr_dia: { // día en texto por ejemplo 'Lunes'
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'atr_dia'
  },
  atr_hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'atr_hora_inicio'
  },
  atr_hora_fin: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'atr_hora_fin'
  },
  atr_creado_por: { type: DataTypes.STRING(15), allowNull: true, field: 'atr_creado_por' },
  atr_fecha_creacion: { type: DataTypes.DATE, allowNull: true, field: 'atr_fecha_creacion' },
  atr_estado: { type: DataTypes.ENUM('ACTIVO','INACTIVO'), allowNull: false, defaultValue: 'ACTIVO', field: 'atr_estado' }
}, {
  tableName: 'tbl_horario_medico',
  timestamps: false
});

MedicoHorario.beforeCreate((h) => {
  if (!h.atr_fecha_creacion) h.atr_fecha_creacion = new Date();
});

module.exports = MedicoHorario;
