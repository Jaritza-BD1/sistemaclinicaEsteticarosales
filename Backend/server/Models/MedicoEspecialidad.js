const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const MedicoEspecialidad = sequelize.define('MedicoEspecialidad', {
  atr_id_medico: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    field: 'atr_id_medico'
  },
  atr_id_especialidad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    field: 'atr_id_especialidad'
  },
  atr_creado_por: { type: DataTypes.STRING(15), allowNull: true, field: 'atr_creado_por' },
  atr_fecha_creacion: { type: DataTypes.DATE, allowNull: true, field: 'atr_fecha_creacion' }
}, {
  tableName: 'tbl_medico_especialidad',
  timestamps: false,
  id: false
});

MedicoEspecialidad.beforeCreate((me) => {
  if (!me.atr_fecha_creacion) me.atr_fecha_creacion = new Date();
});

module.exports = MedicoEspecialidad;
