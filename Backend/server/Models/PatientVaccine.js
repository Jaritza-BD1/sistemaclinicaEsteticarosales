const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const PatientVaccine = sequelize.define('tbl_vacunas_paciente', {
  atr_id_vacuna: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'atr_id_vacuna'
  },
  atr_id_paciente: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'atr_id_paciente',
    references: { model: 'tbl_paciente', key: 'atr_id_paciente' }
  },
  atr_vacuna: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'atr_vacuna'
  },
  atr_fecha_vacunacion: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'atr_fecha_vacunacion'
  }
}, { tableName: 'tbl_vacunas_paciente', timestamps: false });

PatientVaccine.associate = (models) => {
  if (models.Patient) {
    PatientVaccine.belongsTo(models.Patient, { foreignKey: 'atr_id_paciente', as: 'Paciente' });
    models.Patient.hasMany(PatientVaccine, { foreignKey: 'atr_id_paciente', as: 'vacunas' });
  }
};

module.exports = PatientVaccine;
