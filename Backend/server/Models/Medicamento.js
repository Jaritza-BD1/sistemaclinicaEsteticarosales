const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const Medicamento = sequelize.define('Medicamento', {
  atr_id_medicamento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  atr_id_medicamento_base: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Referencia al medicamento del catálogo'
  },
  atr_nombre_medicamento: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  atr_descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  atr_dosis: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  atr_frecuencia: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  atr_duracion: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  atr_id_receta: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'tbl_medicamento',
  timestamps: false
});

Medicamento.associate = (models) => {
  if (models.Receta) {
    Medicamento.belongsTo(models.Receta, { foreignKey: 'atr_id_receta', as: 'receta' });
    models.Receta.hasMany && models.Receta.hasMany(Medicamento, { foreignKey: 'atr_id_receta', sourceKey: 'atr_id_receta', as: 'medicamentos' });
  }
};

module.exports = Medicamento;