const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const Especialidad = sequelize.define('Especialidad', {
  atr_id_especialidad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'atr_id_especialidad'
  },
  atr_especialidad: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'atr_especialidad'
  },
  atr_descripcion: { type: DataTypes.TEXT, allowNull: true, field: 'atr_descripcion' },
  atr_creado_por: { type: DataTypes.STRING(15), allowNull: true, field: 'atr_creado_por' },
  atr_fecha_creacion: { type: DataTypes.DATE, allowNull: true, field: 'atr_fecha_creacion' },
  atr_estado_medico: { type: DataTypes.ENUM('ACTIVO','INACTIVO','VACACIONES'), allowNull: false, defaultValue: 'ACTIVO', field: 'atr_estado_medico' }
}, {
  tableName: 'tbl_especialidad',
  timestamps: false
});

Especialidad.beforeCreate((e) => {
  if (!e.atr_fecha_creacion) e.atr_fecha_creacion = new Date();
});

module.exports = Especialidad;
