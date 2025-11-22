const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const TreatmentProcedure = sequelize.define('TreatmentProcedure', {
  atr_id_procedimiento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'atr_id_procedimiento'
  },
  atr_id_tratamiento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'atr_id_tratamiento'
  },
  atr_procedimiento_tipo: {
    type: DataTypes.ENUM('ESTETICO', 'PODOLOGICO'),
    allowNull: false,
    field: 'atr_procedimiento_tipo'
  },
  atr_procedimiento_codigo: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'atr_procedimiento_codigo'
  },
  atr_procedimiento_nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
    field: 'atr_procedimiento_nombre'
  },
  atr_area: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'atr_area'
  },
  atr_programado_para: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'atr_programado_para'
  },
  atr_ejecutado_el: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'atr_ejecutado_el'
  },
  atr_id_medico: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'atr_id_medico'
  },
  atr_estado: {
    type: DataTypes.ENUM('PROGRAMADO', 'COMPLETADO', 'CANCELADO', 'EN_PROCESO'),
    allowNull: false,
    defaultValue: 'PROGRAMADO',
    field: 'atr_estado'
  },
  atr_resultado: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'atr_resultado'
  },
  atr_imagen_pre: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'atr_imagen_pre'
  },
  atr_imagen_post: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'atr_imagen_post'
  },
  atr_recomendaciones: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'atr_recomendaciones'
  }
}, {
  tableName: 'tbl_tratamiento_procedimiento',
  timestamps: false
});

module.exports = TreatmentProcedure;
