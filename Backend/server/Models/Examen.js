const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const Examen = sequelize.define('Examen', {
  atr_id_examen: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  atr_nombre_examen: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  atr_descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  atr_tipo_examen: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'laboratorio'
  }
}, {
  tableName: 'tbl_examen',
  timestamps: false
});

Examen.associate = (models) => {
  // Un examen es un catálogo; puede tener relaciones si se necesita
  if (models.OrdenExamenDetalle) {
    Examen.hasMany(models.OrdenExamenDetalle, { foreignKey: 'atr_id_examen', sourceKey: 'atr_id_examen', as: 'ordenDetalles' });
  }
};

module.exports = Examen;
