// File: server/Controllers/rescheduleController.js
const logger = require('../utils/logger');
module.exports = {
  async reschedule(req, res, next) {
    try {
      const { id } = req.params;
      const { newDate, newTime, reason } = req.body;
      await req.services.appointment.reschedule(id, { newDate, newTime, reason });
      res.json({ success: true });
    } catch (err) {
      logger.error('Error reprogramar cita', err);
      next(err);
    }
  }
};