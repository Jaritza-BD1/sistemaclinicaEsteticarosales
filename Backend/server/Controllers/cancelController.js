// File: server/Controllers/cancelController.js
const logger = require('../utils/logger');
module.exports = {
  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      await req.services.appointment.cancel(id, reason);
      res.json({ success: true });
    } catch (err) {
      logger.error('Error cancelar cita', err);
      next(err);
    }
  }
};