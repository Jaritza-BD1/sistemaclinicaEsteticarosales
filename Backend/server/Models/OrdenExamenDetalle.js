const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const OrdenExamenDetalle = sequelize.define('OrdenExamenDetalle', {
  atr_id_orden_detalle: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  atr_id_examen: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  atr_id_orden_exa: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  atr_observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // FK opcional a consulta médica para enlazar resultados a una consulta
  atr_id_consulta: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'tbl_orden_examen_detalle',
  timestamps: false
});

OrdenExamenDetalle.associate = (models) => {
  if (models.OrdenExamen) {
    OrdenExamenDetalle.belongsTo(models.OrdenExamen, { foreignKey: 'atr_id_orden_exa', as: 'orden' });
  }
  if (models.Examen) {
    OrdenExamenDetalle.belongsTo(models.Examen, { foreignKey: 'atr_id_examen', as: 'examen' });
    models.Examen.hasMany && models.Examen.hasMany(OrdenExamenDetalle, { foreignKey: 'atr_id_examen', sourceKey: 'atr_id_examen', as: 'ordenDetalles' });
  }
  if (models.Consultation) {
    OrdenExamenDetalle.belongsTo(models.Consultation, { foreignKey: 'atr_id_consulta', as: 'consultation' });
  }
};

module.exports = OrdenExamenDetalle;
