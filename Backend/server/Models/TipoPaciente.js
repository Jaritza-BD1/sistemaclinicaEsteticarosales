const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const TipoPaciente = sequelize.define('tbl_tipo_paciente', {
  atr_id_tipo_paciente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'atr_id_tipo_paciente'
  },
  atr_descripcion: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'atr_descripcion'
  }
}, {
  tableName: 'tbl_tipo_paciente',
  timestamps: false
});

// Asociaciones (definidas en Models/index.js cuando se cargan todos los modelos)
TipoPaciente.associate = (models) => {
  if (models.Patient) {
    TipoPaciente.hasMany(models.Patient, {
      foreignKey: 'atr_id_tipo_paciente',
      sourceKey: 'atr_id_tipo_paciente',
      as: 'pacientes'
    });
  }
};

module.exports = TipoPaciente;
