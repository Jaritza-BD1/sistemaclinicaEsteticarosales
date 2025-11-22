const { DataTypes } = require('sequelize');
const sequelize = require('../Config/db');

const Consultation = sequelize.define('Consultation', {
  atr_id_consulta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  atr_id_cita: { type: DataTypes.INTEGER, allowNull: true },
  atr_id_paciente: { type: DataTypes.INTEGER },
  atr_id_medico: { type: DataTypes.INTEGER },
  atr_fecha_consulta: { type: DataTypes.DATEONLY },
  atr_sintomas_paciente: { type: DataTypes.STRING(200) },
  atr_cantidad_medicamento: { type: DataTypes.STRING(50) },
  atr_observaciones: { type: DataTypes.TEXT },
  atr_evolucion_paciente: { type: DataTypes.STRING(100) },
  atr_prescripcion: { type: DataTypes.STRING(100) },
  atr_fecha_resultado_estudio: { type: DataTypes.DATEONLY },
  atr_problemas_salud: { type: DataTypes.STRING(200) },
  atr_antecedentes_familiares: { type: DataTypes.STRING(100) },
  atr_peso: { type: DataTypes.FLOAT },
  atr_altura: { type: DataTypes.FLOAT },
  atr_temperatura: { type: DataTypes.FLOAT },
  atr_diagnostico: { type: DataTypes.STRING(200) },
  atr_notas_clinicas: { type: DataTypes.TEXT },
  atr_seguimiento: { type: DataTypes.BOOLEAN, defaultValue: false },
  atr_sig_visit_dia: { type: DataTypes.DATEONLY },
  atr_estado_seguimiento: { type: DataTypes.ENUM('PENDIENTE','EN_PROCESO','CERRADO'), defaultValue: 'PENDIENTE' },
  atr_creado_por: { type: DataTypes.INTEGER },
  atr_fecha_creacion: { type: DataTypes.DATE },
  atr_fecha_actualizacion: { type: DataTypes.DATE }
}, {
  tableName: 'tbl_consulta_medica',
  timestamps: false
});

Consultation.associate = (models) => {
  if (models.Patient) {
    Consultation.belongsTo(models.Patient, { foreignKey: 'atr_id_paciente', as: 'patient' });
    models.Patient.hasMany && models.Patient.hasMany(Consultation, { foreignKey: 'atr_id_paciente', sourceKey: 'atr_id_paciente', as: 'consultas' });
  }
  if (models.Doctor) {
    Consultation.belongsTo(models.Doctor, { foreignKey: 'atr_id_medico', as: 'doctor' });
    models.Doctor.hasMany && models.Doctor.hasMany(Consultation, { foreignKey: 'atr_id_medico', sourceKey: 'atr_id_medico', as: 'consultas' });
  }
  if (models.Appointment) {
    Consultation.belongsTo(models.Appointment, { foreignKey: 'atr_id_cita', as: 'appointment' });
    models.Appointment.hasOne && models.Appointment.hasOne(Consultation, { foreignKey: 'atr_id_cita', sourceKey: 'atr_id_cita', as: 'consultation' });
  }
  if (models.OrdenExamen) {
    Consultation.hasMany(models.OrdenExamen, { foreignKey: 'atr_id_consulta', as: 'ordenesExamen' });
  }
  if (models.Receta) {
    Consultation.hasMany(models.Receta, { foreignKey: 'atr_id_consulta', as: 'recetas' });
  }
  if (models.Treatment) {
    Consultation.hasMany(models.Treatment, { foreignKey: 'atr_id_consulta', as: 'tratamientos' });
  }
  if (models.Exam) {
    Consultation.hasMany(models.Exam, { foreignKey: 'atr_id_consulta', as: 'exams' });
  }
};

module.exports = Consultation;
