const appointmentService = require('../services/appointmentService');
const logger = require('../utils/logger');
const ResponseService = require('../services/responseService');

/**
 * Controlador para manejar operaciones de pagos de citas
 */
class PaymentController {
  /**
   * Obtener todas las citas pendientes de pago
   * GET /api/payments/pending
   */
  async getPendingPayments(req, res) {
    try {
      const { fecha, medicoId } = req.query;

      const filters = {};
      if (fecha) filters.fecha = fecha;
      if (medicoId) filters.medicoId = parseInt(medicoId);

      const pendingPayments = await appointmentService.getPendingPayments(filters);

      return ResponseService.success(res, pendingPayments);
    } catch (error) {
      logger.error('Error obteniendo pagos pendientes:', error);
      return ResponseService.internalError(res, 'Error al obtener pagos pendientes');
    }
  }

  /**
   * Procesar el pago de una cita
   * POST /api/payments/:appointmentId/pay
   */
  async payAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const { formaPago, referencia, observacion } = req.body;

      // Obtener el usuario de caja (usuario autenticado)
      const usuarioCajaId = req.user?.atr_id_usuario || 1;

      // Preparar datos de pago opcionales
      const datosPago = {};
      if (formaPago) datosPago.formaPago = formaPago;
      if (referencia) datosPago.referencia = referencia;
      if (observacion) datosPago.observacion = observacion;

      const result = await appointmentService.payAppointment(
        parseInt(appointmentId),
        usuarioCajaId,
        datosPago
      );

      return ResponseService.success(res, {
        message: 'Pago procesado exitosamente',
        cita: result
      });
    } catch (error) {
      logger.error('Error procesando pago:', error);

      // Manejar errores específicos
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }

      return ResponseService.internalError(res, 'Error al procesar el pago');
    }
  }

  /**
   * Obtener estadísticas de pagos pendientes
   * GET /api/payments/stats
   */
  async getPaymentStats(req, res) {
    try {
      const { fecha, medicoId } = req.query;

      const filters = {};
      if (fecha) filters.fecha = fecha;
      if (medicoId) filters.medicoId = parseInt(medicoId);

      const pendingPayments = await appointmentService.getPendingPayments(filters);

      // Calcular estadísticas
      const stats = {
        totalPendientes: pendingPayments.length,
        porMedico: {},
        porFecha: {},
        totalMontoEstimado: 0 // Podría calcularse basado en tipo de cita
      };

      // Agrupar por médico
      pendingPayments.forEach(appointment => {
        const medicoId = appointment.atr_id_medico;
        const medicoNombre = `${appointment.Doctor.atr_nombre} ${appointment.Doctor.atr_apellido}`;

        if (!stats.porMedico[medicoId]) {
          stats.porMedico[medicoId] = {
            nombre: medicoNombre,
            cantidad: 0,
            citas: []
          };
        }

        stats.porMedico[medicoId].cantidad++;
        stats.porMedico[medicoId].citas.push({
          id: appointment.atr_id_cita,
          fecha: appointment.atr_fecha_cita,
          hora: appointment.atr_hora_cita,
          paciente: `${appointment.Patient.atr_nombre} ${appointment.Patient.atr_apellido}`
        });
      });

      // Agrupar por fecha
      pendingPayments.forEach(appointment => {
        const fecha = appointment.atr_fecha_cita;

        if (!stats.porFecha[fecha]) {
          stats.porFecha[fecha] = {
            cantidad: 0,
            citas: []
          };
        }

        stats.porFecha[fecha].cantidad++;
        stats.porFecha[fecha].citas.push({
          id: appointment.atr_id_cita,
          hora: appointment.atr_hora_cita,
          medico: `${appointment.Doctor.atr_nombre} ${appointment.Doctor.atr_apellido}`,
          paciente: `${appointment.Patient.atr_nombre} ${appointment.Patient.atr_apellido}`
        });
      });

      return ResponseService.success(res, stats);
    } catch (error) {
      logger.error('Error obteniendo estadísticas de pagos:', error);
      return ResponseService.internalError(res, 'Error al obtener estadísticas de pagos');
    }
  }
}

module.exports = new PaymentController();