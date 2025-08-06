// Backend/server/Middlewares/calendarMiddleware.js
const appointmentService = require('../services/appointmentService');
// Puedes agregar más servicios aquí si lo necesitas

module.exports = (req, res, next) => {
  req.services = {
    appointment: appointmentService,
    // otros servicios si es necesario
  };
  next();
}; 