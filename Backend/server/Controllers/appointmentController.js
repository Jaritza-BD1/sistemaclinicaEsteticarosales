// File: server/Controllers/appointmentController.js
const { Appointment } = require('../Models');
const logger = require('../utils/logger');

module.exports = {
  async create(req, res, next) {
    try {
      // req.user.id obtenido de authMiddleware (JWT)
      const userId = req.user.id;
      const data = { ...req.body, atr_id_usuario: userId };
      // Uso de service para validaciones de negocio
      const appointment = await req.services.appointment.create(data);
      res.status(201).json({ success: true, data: appointment });
    } catch (err) {
      logger.error('Error crear cita', err);
      next(err);
    }
  },

  async list(req, res, next) {
    try {
      const appointments = await req.services.appointment.list();
      res.json({ success: true, data: appointments });
    } catch (err) {
      logger.error('Error listar citas', err);
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const appointment = await req.services.appointment.getById(id);
      if (!appointment) return res.status(404).json({ error: 'No encontrado' });
      res.json({ success: true, data: appointment });
    } catch (err) {
      logger.error('Error obtener cita', err);
      next(err);
    }
  }
};
