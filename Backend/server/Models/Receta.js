const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const Receta = sequelize.define('Receta', {
  atr_id_receta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  atr_fecha_receta: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  atr_id_consulta: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  atr_id_paciente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  atr_id_medico: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  atr_estado_receta: {
    type: DataTypes.ENUM('PENDIENTE_ENTREGA', 'ENTREGADA', 'CANCELADA'),
    allowNull: false,
    defaultValue: 'PENDIENTE_ENTREGA'
  }
}, {
  tableName: 'tbl_receta',
  timestamps: false
});

Receta.associate = (models) => {
  if (models.Consultation) {
    Receta.belongsTo(models.Consultation, { foreignKey: 'atr_id_consulta', as: 'consultation' });
    models.Consultation.hasMany && models.Consultation.hasMany(Receta, { foreignKey: 'atr_id_consulta', sourceKey: 'atr_id_consulta', as: 'recetas' });
  }
  if (models.Medicamento) {
    Receta.hasMany(models.Medicamento, { foreignKey: 'atr_id_receta', sourceKey: 'atr_id_receta', as: 'medicamentos' });
  }
};

module.exports = Receta;