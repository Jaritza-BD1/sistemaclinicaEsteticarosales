// File: server/models/index.js
const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');
const Treatment = require('./Treatment');
const Exam = require('./Exam');
const Examen = require('./Examen');
const OrdenExamen = require('./OrdenExamen');
const OrdenExamenDetalle = require('./OrdenExamenDetalle');
const Receta = require('./Receta');
const Medicamento = require('./Medicamento');
const Rol = require('./Rol');
const Permiso = require('./Permiso');
const Objeto = require('./Objeto');
const Producto = require('./Producto');
const Bitacora = require('./Bitacora');
const PasswordHistory = require('./PasswordHistory');
const BackupCode = require('./BackupCode');
const Backup = require('./Backup');
const Parametro = require('./Parametro');
const EstadoCita = require('./EstadoCita');
const TipoCita = require('./TipoCita');
const Recordatorio = require('./Recordatorio');
const EstadoRecordatorio = require('./EstadoRecordatorio');
const EstadoBitacoraRecordatorio = require('./EstadoBitacoraRecordatorio');
const ConfCita = require('./ConfCita');
const Consultation = require('./Consultation');
const TipoMedico = require('./TipoMedico');
const Especialidad = require('./Especialidad');
const Genero = require('./Genero');
const TipoPaciente = require('./TipoPaciente');
const MedicoEspecialidad = require('./MedicoEspecialidad');
const MedicoHorario = require('./MedicoHorario');
const TreatmentProcedure = require('./TreatmentProcedure');
const TreatmentProcedureProduct = require('./TreatmentProcedureProduct');
const PatientAllergy = require('./PatientAllergy');
const PatientVaccine = require('./PatientVaccine');
const ReprogramarCita = require('./ReprogramarCita');
const CleanupRun = require('./CleanupRun');

// Relaciones de direcciones, emails y teléfonos
const PatientAddress = require('./PatientAddress');
const PatientEmail = require('./PatientEmail');
const PatientPhone = require('./PatientPhone');
const DoctorAddress = require('./DoctorAddress');
const DoctorEmail = require('./DoctorEmail');
const DoctorPhone = require('./DoctorPhone');

const models = {
  User,
  Patient,
  Doctor,
  Appointment,
  Treatment,
  Exam,
  Examen,
  OrdenExamen,
  OrdenExamenDetalle,
  Examen,
  Receta,
  Medicamento,
  Rol,
  Permiso,
  Objeto,
  Producto,
  Bitacora,
  PasswordHistory,
  BackupCode,
  Backup,
  Parametro,
  EstadoCita,
  TipoCita,
  Recordatorio,
  EstadoRecordatorio,
  EstadoBitacoraRecordatorio,
  ConfCita,
  Consultation,
  TipoMedico,
  Especialidad,
  MedicoEspecialidad,
  MedicoHorario,
  Genero,
  TipoPaciente,
  PatientAddress,
  PatientEmail,
  PatientPhone,
  PatientAllergy,
  PatientVaccine,
  DoctorAddress,
  DoctorEmail,
  DoctorPhone
  ,
  TreatmentProcedure,
  TreatmentProcedureProduct
  ,
  CleanupRun,
  ReprogramarCita
};

// Centralizar asociaciones aquí para evitar dependencias circulares
try {
  // Appointment associations
  if (models.Appointment && models.Recordatorio) {
    models.Appointment.hasMany(models.Recordatorio, { foreignKey: 'atr_id_cita', as: 'Recordatorios' });
    models.Recordatorio.belongsTo(models.Appointment, { foreignKey: 'atr_id_cita', as: 'Appointment' });
  }
  if (models.Appointment && models.ConfCita) {
    models.Appointment.hasMany(models.ConfCita, { foreignKey: 'atr_id_cita', as: 'Confirmaciones' });
    models.ConfCita.belongsTo(models.Appointment, { foreignKey: 'atr_id_cita', as: 'Appointment' });
  }
  if (models.ConfCita && models.User) {
    models.ConfCita.belongsTo(models.User, { foreignKey: 'atr_confirmado_por', as: 'ConfirmadoPor' });
  }

  // EstadoBitacoraRecordatorio associations
  if (models.EstadoBitacoraRecordatorio && models.Recordatorio) {
    models.EstadoBitacoraRecordatorio.belongsTo(models.Recordatorio, { foreignKey: 'atr_id_recordatorio' });
    models.Recordatorio.hasMany(models.EstadoBitacoraRecordatorio, { foreignKey: 'atr_id_recordatorio' });
  }

  // Nota: las asociaciones relacionadas con Consultation, Exam/Examen,
  // OrdenExamen y OrdenExamenDetalle se definen dentro de sus modelos respectivos
  // (método associate) para evitar alias duplicados y mantener la lógica agrupada.

  if (models.Appointment && models.Patient) {
    models.Appointment.belongsTo(models.Patient, { foreignKey: 'atr_id_paciente', as: 'Patient' });
    // Reciprocal association to allow eager-loading joins from Patient side
    if (typeof models.Patient.hasMany === 'function') {
      models.Patient.hasMany(models.Appointment, { foreignKey: 'atr_id_paciente', sourceKey: 'atr_id_paciente', as: 'Appointments' });
    }
  }

  // Paciente <-> Contactos (teléfonos, correos, direcciones)
  if (models.Patient && models.PatientPhone) {
    models.Patient.hasMany(models.PatientPhone, { foreignKey: 'atr_id_paciente', sourceKey: 'atr_id_paciente', as: 'telefonos' });
    models.PatientPhone.belongsTo(models.Patient, { foreignKey: 'atr_id_paciente', targetKey: 'atr_id_paciente', as: 'Paciente' });
  }
  if (models.Patient && models.PatientEmail) {
    models.Patient.hasMany(models.PatientEmail, { foreignKey: 'atr_id_paciente', sourceKey: 'atr_id_paciente', as: 'correos' });
    models.PatientEmail.belongsTo(models.Patient, { foreignKey: 'atr_id_paciente', targetKey: 'atr_id_paciente', as: 'Paciente' });
  }
  if (models.Patient && models.PatientAddress) {
    models.Patient.hasMany(models.PatientAddress, { foreignKey: 'atr_id_paciente', sourceKey: 'atr_id_paciente', as: 'direcciones' });
    models.PatientAddress.belongsTo(models.Patient, { foreignKey: 'atr_id_paciente', targetKey: 'atr_id_paciente', as: 'Paciente' });
  }
  // Paciente <-> Alergias
  if (models.Patient && models.PatientAllergy) {
    models.Patient.hasMany(models.PatientAllergy, { foreignKey: 'atr_id_paciente', sourceKey: 'atr_id_paciente', as: 'alergias' });
    models.PatientAllergy.belongsTo(models.Patient, { foreignKey: 'atr_id_paciente', targetKey: 'atr_id_paciente', as: 'Paciente' });
  }
  // Paciente <-> Vacunas
  if (models.Patient && models.PatientVaccine) {
    models.Patient.hasMany(models.PatientVaccine, { foreignKey: 'atr_id_paciente', sourceKey: 'atr_id_paciente', as: 'vacunas' });
    models.PatientVaccine.belongsTo(models.Patient, { foreignKey: 'atr_id_paciente', targetKey: 'atr_id_paciente', as: 'Paciente' });
  }
  
  // Patient <-> Consultation (historial de consultas)
  if (models.Patient && models.Consultation) {
    models.Patient.hasMany(models.Consultation, { foreignKey: 'atr_id_paciente', sourceKey: 'atr_id_paciente', as: 'consultas' });
    models.Consultation.belongsTo(models.Patient, { foreignKey: 'atr_id_paciente', targetKey: 'atr_id_paciente', as: 'patient' });
  }

  // Consultation <-> Appointment
  if (models.Consultation && models.Appointment) {
    models.Consultation.belongsTo(models.Appointment, { foreignKey: 'atr_id_cita', targetKey: 'atr_id_cita', as: 'appointment' });
    models.Appointment.hasOne(models.Consultation, { foreignKey: 'atr_id_cita', sourceKey: 'atr_id_cita', as: 'consultation' });
  }
  // Paciente <-> Genero (many-to-one)
  if (models.Patient && models.Genero) {
    models.Patient.belongsTo(models.Genero, { foreignKey: 'atr_id_genero', targetKey: 'atr_id_genero', as: 'genero' });
    models.Genero.hasMany(models.Patient, { foreignKey: 'atr_id_genero', sourceKey: 'atr_id_genero', as: 'pacientes' });
  }
  // Paciente <-> TipoPaciente (many-to-one)
  if (models.Patient && models.TipoPaciente) {
    models.Patient.belongsTo(models.TipoPaciente, { foreignKey: 'atr_id_tipo_paciente', targetKey: 'atr_id_tipo_paciente', as: 'tipoPaciente' });
    models.TipoPaciente.hasMany(models.Patient, { foreignKey: 'atr_id_tipo_paciente', sourceKey: 'atr_id_tipo_paciente', as: 'pacientes' });
  }
  if (models.Appointment && models.Doctor) {
    models.Appointment.belongsTo(models.Doctor, { foreignKey: 'atr_id_medico', as: 'Doctor' });
    // Reciprocal association
    if (typeof models.Doctor.hasMany === 'function') {
      models.Doctor.hasMany(models.Appointment, { foreignKey: 'atr_id_medico', sourceKey: 'atr_id_medico', as: 'Appointments' });
    }
  }
  if (models.Appointment && models.User) {
    models.Appointment.belongsTo(models.User, { foreignKey: 'atr_id_usuario', as: 'User' });
  }
  if (models.Appointment && models.EstadoCita) {
    models.Appointment.belongsTo(models.EstadoCita, { foreignKey: 'atr_id_estado', as: 'EstadoCita' });
  }
  if (models.Appointment && models.TipoCita) {
    models.Appointment.belongsTo(models.TipoCita, { foreignKey: 'atr_id_tipo_cita', as: 'TipoCita' });
  }
  // Permiso associations
  if (models.Permiso && models.Rol && models.Objeto) {
    models.Permiso.belongsTo(models.Rol, { foreignKey: 'atr_id_rol', as: 'Rol' });
    models.Rol.hasMany(models.Permiso, { foreignKey: 'atr_id_rol', as: 'Permisos' });

    models.Permiso.belongsTo(models.Objeto, { foreignKey: 'atr_id_objeto', targetKey: 'atr_id_objetos', as: 'Objeto' });
    models.Objeto.hasMany(models.Permiso, { foreignKey: 'atr_id_objeto', sourceKey: 'atr_id_objetos', as: 'Permisos' });
  }

  // Treatment associations
  if (models.Treatment && models.Patient && models.Doctor) {
    models.Treatment.belongsTo(models.Patient, { foreignKey: 'atr_id_paciente', targetKey: 'atr_id_paciente', as: 'patient' });
    models.Treatment.belongsTo(models.Doctor, { foreignKey: 'atr_id_medico', targetKey: 'atr_id_medico', as: 'doctor' });
    models.Patient.hasMany(models.Treatment, { foreignKey: 'atr_id_paciente', sourceKey: 'atr_id_paciente', as: 'treatments' });
    models.Doctor.hasMany(models.Treatment, { foreignKey: 'atr_id_medico', sourceKey: 'atr_id_medico', as: 'treatments' });
  }

  // Vincular Treatment con Consultation para poder navegar tratamientos por consulta
  if (models.Treatment && models.Consultation) {
    models.Treatment.belongsTo(models.Consultation, { foreignKey: 'atr_id_consulta', targetKey: 'atr_id_consulta', as: 'consulta' });
    models.Consultation.hasMany(models.Treatment, { foreignKey: 'atr_id_consulta', sourceKey: 'atr_id_consulta', as: 'tratamientos' });
  }

  // TreatmentProcedure associations
  if (models.TreatmentProcedure && models.Treatment) {
    models.Treatment.hasMany(models.TreatmentProcedure, { foreignKey: 'atr_id_tratamiento', sourceKey: 'atr_id_tratamiento', as: 'Procedures' });
    models.TreatmentProcedure.belongsTo(models.Treatment, { foreignKey: 'atr_id_tratamiento', targetKey: 'atr_id_tratamiento', as: 'treatment' });
  }

  if (models.TreatmentProcedure && models.Doctor) {
    models.TreatmentProcedure.belongsTo(models.Doctor, { foreignKey: 'atr_id_medico', targetKey: 'atr_id_medico', as: 'Medico' });
    models.Doctor.hasMany(models.TreatmentProcedure, { foreignKey: 'atr_id_medico', sourceKey: 'atr_id_medico', as: 'procedures' });
  }

  if (models.TreatmentProcedure && models.TreatmentProcedureProduct) {
    models.TreatmentProcedure.hasMany(models.TreatmentProcedureProduct, { foreignKey: 'atr_procedimiento_id', sourceKey: 'atr_id_procedimiento', as: 'products' });
    models.TreatmentProcedureProduct.belongsTo(models.TreatmentProcedure, { foreignKey: 'atr_procedimiento_id', targetKey: 'atr_id_procedimiento', as: 'procedure' });
  }

  if (models.TreatmentProcedureProduct && models.Producto) {
    models.TreatmentProcedureProduct.belongsTo(models.Producto, { foreignKey: 'atr_product_id', targetKey: 'atr_id_producto', as: 'product' });
    models.Producto.hasMany(models.TreatmentProcedureProduct, { foreignKey: 'atr_product_id', sourceKey: 'atr_id_producto', as: 'procedureProducts' });
  }

  // TipoMedico <-> Doctor
  if (models.TipoMedico && models.Doctor) {
    models.Doctor.belongsTo(models.TipoMedico, { foreignKey: 'atr_id_tipo_medico', targetKey: 'atr_id_tipo_medico', as: 'TipoMedico' });
    models.TipoMedico.hasMany(models.Doctor, { foreignKey: 'atr_id_tipo_medico', sourceKey: 'atr_id_tipo_medico', as: 'Doctors' });
  }

  // Doctor <-> Genero (many-to-one)
  if (models.Doctor && models.Genero) {
    models.Doctor.belongsTo(models.Genero, { foreignKey: 'atr_id_genero', targetKey: 'atr_id_genero', as: 'genero' });
    models.Genero.hasMany(models.Doctor, { foreignKey: 'atr_id_genero', sourceKey: 'atr_id_genero', as: 'doctores' });
  }

  // Especialidad <-> Doctor (many-to-many through MedicoEspecialidad)
  if (models.Especialidad && models.Doctor && models.MedicoEspecialidad) {
    models.Doctor.belongsToMany(models.Especialidad, { through: models.MedicoEspecialidad, foreignKey: 'atr_id_medico', otherKey: 'atr_id_especialidad', as: 'Especialidades' });
    models.Especialidad.belongsToMany(models.Doctor, { through: models.MedicoEspecialidad, foreignKey: 'atr_id_especialidad', otherKey: 'atr_id_medico', as: 'Medicos' });
  }

  // Horarios de médico (one-to-many)
  if (models.MedicoHorario && models.Doctor) {
    models.Doctor.hasMany(models.MedicoHorario, { foreignKey: 'atr_id_medico', sourceKey: 'atr_id_medico', as: 'Horarios' });
    models.MedicoHorario.belongsTo(models.Doctor, { foreignKey: 'atr_id_medico', targetKey: 'atr_id_medico', as: 'Doctor' });
  }

  // Producto associations
  if (models.Producto && models.User) {
    models.Producto.belongsTo(models.User, { foreignKey: 'atr_creado_por', targetKey: 'atr_id_usuario', as: 'creadoPor' });
    models.Producto.belongsTo(models.User, { foreignKey: 'atr_modificado_por', targetKey: 'atr_id_usuario', as: 'modificadoPor' });
  }

  // ReprogramarCita associations
  if (models.ReprogramarCita && models.Appointment) {
    models.ReprogramarCita.belongsTo(models.Appointment, { foreignKey: 'atr_id_cita', as: 'Cita' });
    models.Appointment.hasMany(models.ReprogramarCita, { foreignKey: 'atr_id_cita', as: 'Reprogramaciones' });
  }

  // OrdenExamen associations
  if (models.OrdenExamen && models.Patient) {
    models.OrdenExamen.belongsTo(models.Patient, { foreignKey: 'atr_id_paciente', as: 'patient' });
    models.Patient.hasMany(models.OrdenExamen, { foreignKey: 'atr_id_paciente', as: 'ordenesExamen' });
  }
  if (models.OrdenExamen && models.Doctor) {
    models.OrdenExamen.belongsTo(models.Doctor, { foreignKey: 'atr_id_medico', as: 'doctor' });
    models.Doctor.hasMany(models.OrdenExamen, { foreignKey: 'atr_id_medico', as: 'ordenesExamen' });
  }
  if (models.OrdenExamen && models.OrdenExamenDetalle) {
    models.OrdenExamen.hasMany(models.OrdenExamenDetalle, { foreignKey: 'atr_id_orden_exa', as: 'detalles' });
  }
  if (models.OrdenExamen && models.Consultation) {
    models.OrdenExamen.belongsTo(models.Consultation, { foreignKey: 'atr_id_consulta', as: 'consultation' });
    models.Consultation.hasMany(models.OrdenExamen, { foreignKey: 'atr_id_consulta', as: 'ordenesExamen' });
  }

  // OrdenExamenDetalle associations
  if (models.OrdenExamenDetalle && models.OrdenExamen) {
    models.OrdenExamenDetalle.belongsTo(models.OrdenExamen, { foreignKey: 'atr_id_orden_exa', as: 'orden' });
  }
  if (models.OrdenExamenDetalle && models.Examen) {
    models.OrdenExamenDetalle.belongsTo(models.Examen, { foreignKey: 'atr_id_examen', as: 'examen' });
    models.Examen.hasMany(models.OrdenExamenDetalle, { foreignKey: 'atr_id_examen', as: 'ordenDetalles' });
  }
  if (models.OrdenExamenDetalle && models.Consultation) {
    models.OrdenExamenDetalle.belongsTo(models.Consultation, { foreignKey: 'atr_id_consulta', as: 'consultation' });
  }

  // Receta associations
  if (models.Receta && models.Consultation) {
    models.Receta.belongsTo(models.Consultation, { foreignKey: 'atr_id_consulta', as: 'consultation' });
    models.Consultation.hasMany(models.Receta, { foreignKey: 'atr_id_consulta', as: 'recetas' });
  }
  if (models.Receta && models.Medicamento) {
    models.Receta.hasMany(models.Medicamento, { foreignKey: 'atr_id_receta', as: 'medicamentos' });
  }

  // Medicamento associations
  if (models.Medicamento && models.Receta) {
    models.Medicamento.belongsTo(models.Receta, { foreignKey: 'atr_id_receta', as: 'receta' });
  }

  // Exam associations (detailed exam records)
  if (models.Exam && models.Patient) {
    models.Exam.belongsTo(models.Patient, { foreignKey: 'atr_id_paciente', as: 'patient' });
    models.Patient.hasMany(models.Exam, { foreignKey: 'atr_id_paciente', as: 'exams' });
  }
  if (models.Exam && models.Doctor) {
    models.Exam.belongsTo(models.Doctor, { foreignKey: 'atr_id_medico', as: 'doctor' });
    models.Exam.belongsTo(models.Doctor, { foreignKey: 'atr_medico_resultados', as: 'resultsDoctor' });
  }
  if (models.Exam && models.Consultation) {
    models.Exam.belongsTo(models.Consultation, { foreignKey: 'atr_id_consulta', as: 'consultation' });
    models.Consultation.hasMany(models.Exam, { foreignKey: 'atr_id_consulta', as: 'exams' });
  }
} catch (err) {
  // No forzar fallo en carga de modelos; solo loguear
  // `logger` no está disponible aquí; usar console para no introducir dependencia
  console.error('Error configurando asociaciones en Models/index.js', err);
}

module.exports = models;