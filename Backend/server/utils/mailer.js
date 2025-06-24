// Backend/src/utils/mailer.js
require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Envía correo de recuperación usando credenciales SMTP recibidas.
 * @param {string} to
 * @param {string} tempPassword
 * @param {number} expiryHours
 * @param {string} smtpEmail
 * @param {string} smtpPass
 */
async function sendResetEmail(to, tempPassword, expiryHours, smtpEmail, smtpPass) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpEmail, pass: smtpPass }
  });

  const mailOptions = {
    from:    smtpEmail,
    to,
    subject: 'Recuperación de contraseña',
    text:    `Su nueva contraseña temporal es: ${tempPassword}\nVigencia: ${expiryHours} horas.\nPor favor, cambie su contraseña al ingresar al sistema.`
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail };
