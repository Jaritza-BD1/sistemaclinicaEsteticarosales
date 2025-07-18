// File: server/services/appointmentService.js
const { Appointment } = require('../Models/Appointment');
const {  EstadoCita } = require('../Models/EstadoCita');
const { Recordatorio } = require('../Models/Recordatorio');
module.exports = {
  async create(data) {
    // lógica de solapamiento, disponibilidad
    return Appointment.create(data);
  },
  async list() {
    return Appointment.findAll();
  },
  async getById(id) {
    return Appointment.findByPk(id);
  },
  async confirm(id) {
    await EstadoCita.create({ atr_estado: true, atr_observacion: null, appointmentId: id });
    return Appointment.update({ atr_id_estado: 2 }, { where: { atr_id_cita: id } });
  },
  async reschedule(id, { newDate, newTime, reason }) {
    return Appointment.update({ atr_fecha_cita: newDate, atr_hora_cita: newTime }, { where: { atr_id_cita: id } });
  },
  async cancel(id, reason) {
    await Recordatorio.create({ atr_id_cita: id, atr_fecha_hora_envio: new Date(), atr_medio: 'notificación app', atr_contenido: reason, atr_id_estado_recordatorio: 1 });
    return Appointment.update({ atr_id_estado: 3 }, { where: { atr_id_cita: id } });
  },
  async sendReminders() {
    // lógica para enviar recordatorios programados
    return [];
  }
};
