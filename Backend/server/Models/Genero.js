const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const Genero = sequelize.define('Genero', {
  atr_id_genero: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: 'atr_id_genero'
  },
  atr_genero: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'atr_genero'
  },
  atr_creado_por: { type: DataTypes.STRING(15), allowNull: true, field: 'atr_creado_por' },
  atr_fecha_creacion: { type: DataTypes.DATE, allowNull: true, field: 'atr_fecha_creacion' },
  atr_modificado_por: { type: DataTypes.STRING(15), allowNull: true, field: 'atr_fecha_modificacion' },
  atr_fecha_modificacion: { type: DataTypes.DATE, allowNull: true, field: 'atr_fecha_modificacion' }
}, {
  tableName: 'tbl_genero',
  timestamps: false
});

Genero.beforeCreate((g) => {
  if (!g.atr_fecha_creacion) g.atr_fecha_creacion = new Date();
});

Genero.beforeUpdate((g) => {
  g.atr_fecha_modificacion = new Date();
});

module.exports = Genero;
