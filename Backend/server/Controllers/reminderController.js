const logger = require('../utils/logger');
module.exports = {
  async send(req, res, next) {
    try {
      const results = await req.services.appointment.sendReminders();
      res.json({ success: true, data: results });
    } catch (err) {
      logger.error('Error enviar recordatorios', err);
      next(err);
    }
  }
};