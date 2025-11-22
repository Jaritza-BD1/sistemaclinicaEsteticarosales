const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const OrdenExamen = sequelize.define('OrdenExamen', {
  atr_id_orden_exa: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  atr_fecha_solicitud: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  atr_resultados_disponibles: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  atr_id_consulta: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'tbl_orden_examen',
  timestamps: false
});

OrdenExamen.associate = (models) => {
  if (models.Patient) {
    OrdenExamen.belongsTo(models.Patient, { foreignKey: 'atr_id_paciente', as: 'patient' });
    models.Patient.hasMany && models.Patient.hasMany(OrdenExamen, { foreignKey: 'atr_id_paciente', sourceKey: 'atr_id_paciente', as: 'ordenesExamen' });
  }
  if (models.Doctor) {
    OrdenExamen.belongsTo(models.Doctor, { foreignKey: 'atr_id_medico', as: 'doctor' });
    models.Doctor.hasMany && models.Doctor.hasMany(OrdenExamen, { foreignKey: 'atr_id_medico', sourceKey: 'atr_id_medico', as: 'ordenesExamen' });
  }
  if (models.OrdenExamenDetalle) {
    OrdenExamen.hasMany(models.OrdenExamenDetalle, { foreignKey: 'atr_id_orden_exa', sourceKey: 'atr_id_orden_exa', as: 'detalles' });
  }
  if (models.Consultation) {
    OrdenExamen.belongsTo(models.Consultation, { foreignKey: 'atr_id_consulta', as: 'consultation' });
  }
};

module.exports = OrdenExamen;
