// File: server/models/index.js
const Appointment = require('./Appointment');
const EstadoCita = require('./EstadoCita');
const TipoCita = require('./TipoCita');
const Recordatorio = require('./Recordatorio');
const EstadoRecordatorio = require('./EstadoRecordatorio');

// Definir associations si es necesario
module.exports = { Appointment, EstadoCita, TipoCita, Recordatorio, EstadoRecordatorio };