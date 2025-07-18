const { EstadoCita, Appointment } = require('../Models');

module.exports = {
  async confirm(req, res, next) {
    try {
      const { id } = req.params;
      // TODO: crear registro de estado confirmado
      await EstadoCita.create({ appointmentId: id, estado: true });
      await Appointment.update({ atr_id_estado: /* confirmado */ 2 }, { where: { atr_id_cita: id } });
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
};
