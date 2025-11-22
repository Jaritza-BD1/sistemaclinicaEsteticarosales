const nodemailer = require('nodemailer');
const config = require('../Config/environment');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * Envía un email
   * @param {Object} options - Opciones del email
   * @param {string} options.to - Destinatario
   * @param {string} options.subject - Asunto
   * @param {string} options.html - Contenido HTML
   * @param {string} options.text - Contenido texto plano (opcional)
   * @returns {Promise<Object>} Resultado del envío
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
        text
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email enviado exitosamente a ${to}: ${result.messageId}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error(`Error enviando email a ${to}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía recordatorio de cita por email
   * @param {Object} reminderData - Datos del recordatorio
   * @param {Object} appointmentData - Datos de la cita
   * @param {Object} patientData - Datos del paciente
   * @param {Object} doctorData - Datos del doctor
   * @returns {Promise<Object>} Resultado del envío
   */
  async sendAppointmentReminder(reminderData, appointmentData, patientData, doctorData) {
    const { atr_fecha_cita, atr_hora_cita, atr_motivo_cita } = appointmentData;
    const { atr_nombres: patientName } = patientData;
    const { atr_nombres: doctorName, atr_apellidos: doctorLastName } = doctorData;

    // Buscar email del paciente
    const PatientEmail = require('../Models/PatientEmail');
    const patientEmail = await PatientEmail.findOne({
      where: { atr_id_paciente: patientData.atr_id_paciente }
    });

    if (!patientEmail) {
      logger.warn(`No se encontró email para el paciente ${patientName} (ID: ${patientData.atr_id_paciente})`);
      return { success: false, error: 'No se encontró email del paciente' };
    }

    const subject = 'Recordatorio de Cita - Clínica Estética Rosales';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Recordatorio de Cita</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Detalles de su cita:</h3>
          <p><strong>Paciente:</strong> ${patientName}</p>
          <p><strong>Doctor:</strong> Dr. ${doctorName} ${doctorLastName}</p>
          <p><strong>Fecha:</strong> ${new Date(atr_fecha_cita).toLocaleDateString('es-ES')}</p>
          <p><strong>Hora:</strong> ${atr_hora_cita}</p>
          <p><strong>Motivo:</strong> ${atr_motivo_cita || 'Consulta médica'}</p>
        </div>
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>⚠️ Importante:</strong> Le recordamos que tiene una cita programada.
            Si no puede asistir, por favor cancele o reprograme con anticipación.
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            Clínica Estética Rosales<br>
            Cuidando de su belleza y salud
          </p>
        </div>
      </div>
    `;

    const text = `
      RECORDATORIO DE CITA - CLÍNICA ESTÉTICA ROSALES

      Detalles de su cita:
      Paciente: ${patientName}
      Doctor: Dr. ${doctorName} ${doctorLastName}
      Fecha: ${new Date(atr_fecha_cita).toLocaleDateString('es-ES')}
      Hora: ${atr_hora_cita}
      Motivo: ${atr_motivo_cita || 'Consulta médica'}

      Importante: Le recordamos que tiene una cita programada.
      Si no puede asistir, por favor cancele o reprograme con anticipación.

      Clínica Estética Rosales - Cuidando de su belleza y salud
    `;

    return await this.sendEmail({
      to: patientEmail.atr_correo,
      subject,
      html,
      text
    });
  }

  /**
   * Verifica la conexión con el servidor SMTP
   * @returns {Promise<boolean>} True si la conexión es exitosa
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('Conexión SMTP verificada exitosamente');
      return true;
    } catch (error) {
      logger.error('Error verificando conexión SMTP:', error);
      return false;
    }
  }
}

module.exports = new EmailService();