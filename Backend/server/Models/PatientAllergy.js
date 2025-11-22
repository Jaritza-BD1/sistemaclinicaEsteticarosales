const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const PatientAllergy = sequelize.define('tbl_alergias_paciente', {
  atr_id_alergia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'atr_id_alergia'
  },
  atr_alergia: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'atr_alergia'
  },
  atr_id_paciente: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'atr_id_paciente',
    references: { model: 'tbl_paciente', key: 'atr_id_paciente' }
  }
}, { tableName: 'tbl_alergias_paciente', timestamps: false });

PatientAllergy.associate = (models) => {
  if (models.Patient) {
    PatientAllergy.belongsTo(models.Patient, { foreignKey: 'atr_id_paciente', as: 'Paciente' });
    models.Patient.hasMany(PatientAllergy, { foreignKey: 'atr_id_paciente', as: 'alergias' });
  }
};

module.exports = PatientAllergy;
