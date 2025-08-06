// File: server/models/index.js
const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');
const Treatment = require('./Treatment');
const Exam = require('./Exam');
const Rol = require('./Rol');
const Permiso = require('./Permiso');
const Objeto = require('./Objeto');
const Producto = require('./Producto');
const Bitacora = require('./Bitacora');
const PasswordHistory = require('./PasswordHistory');
const BackupCode = require('./BackupCode');
const Parametro = require('./Parametro');
const EstadoCita = require('./EstadoCita');
const TipoCita = require('./TipoCita');
const Recordatorio = require('./Recordatorio');
const EstadoRecordatorio = require('./EstadoRecordatorio');

// Relaciones de direcciones, emails y teléfonos
const PatientAddress = require('./PatientAddress');
const PatientEmail = require('./PatientEmail');
const PatientPhone = require('./PatientPhone');
const DoctorAddress = require('./DoctorAddress');
const DoctorEmail = require('./DoctorEmail');
const DoctorPhone = require('./DoctorPhone');

module.exports = {
  User,
  Patient,
  Doctor,
  Appointment,
  Treatment,
  Exam,
  Rol,
  Permiso,
  Objeto,
  Producto,
  Bitacora,
  PasswordHistory,
  BackupCode,
  Parametro,
  EstadoCita,
  TipoCita,
  Recordatorio,
  EstadoRecordatorio,
  PatientAddress,
  PatientEmail,
  PatientPhone,
  DoctorAddress,
  DoctorEmail,
  DoctorPhone
};