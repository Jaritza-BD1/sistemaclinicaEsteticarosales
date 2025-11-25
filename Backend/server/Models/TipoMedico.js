const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const TipoMedico = sequelize.define('TipoMedico', {
  atr_id_tipo_medico: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'atr_id_tipo_medico'
  },
  atr_nombre_tipo_medico: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'atr_nombre_tipo_medico'
  },
  atr_creado_por: { type: DataTypes.STRING(15), allowNull: true, field: 'atr_creado_por' },
  atr_fecha_creacion: { type: DataTypes.DATE, allowNull: true, field: 'atr_fecha_creacion' },
  atr_modificado_por: { type: DataTypes.STRING(15), allowNull: true, field: 'atr_modificado_por' },
  atr_fecha_modificacion: { type: DataTypes.DATE, allowNull: true, field: 'atr_fecha_modificacion' }
}, {
  tableName: 'tbl_tipo_medico',
  timestamps: false
});

TipoMedico.beforeCreate((t) => {
  if (!t.atr_fecha_creacion) t.atr_fecha_creacion = new Date();
});

TipoMedico.beforeUpdate((t) => {
  t.atr_fecha_modificacion = new Date();
});

module.exports = TipoMedico;
