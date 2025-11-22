require('dotenv').config();
const nodemailer = require('nodemailer');

// Configurar transporter global
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'clinicaesteticarosales@gmail.com',
    pass: process.env.SMTP_PASS || 'ktee rmex yahb migi'
  }
});

// URL del frontend desde variables de entorno
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const loginUrl = `${frontendUrl}/login`;

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

// Plantillas de email
const templates = {
  verification: (email, token, name) => ({
    to: email,
    subject: 'Verifica tu correo',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Bienvenido a Clínica Estética Rosales!</h2>
        <p>Hola ${name},</p>
        <p>Por favor verifica tu correo haciendo clic en el siguiente enlace:</p>
        <a href="${FRONTEND_URL}/email-verified?token=${token}">Verificar correo</a>
        <p>Si no solicitaste esto, ignora este mensaje.</p>
      </div>
    `
  }),
  verificationCode: (email, code, name) => ({
    to: email,
    subject: 'Código de verificación - Clínica Estética Rosales',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Código de verificación</h2>
        <p>Hola ${name},</p>
        <p>Tu código de verificación es:</p>
        <div style="text-align: center; margin: 20px 0;">
          <div style="display: inline-block; background: #f8f9fa; padding: 12px 18px; border-radius: 6px; font-family: monospace; font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</div>
        </div>
        <p>El código expira en 24 horas. Si no solicitaste este código, ignora este mensaje.</p>
      </div>
    `
  }),
  passwordResetCode: (email, code, name) => ({
    to: email,
    subject: 'Código de restablecimiento de contraseña - Clínica Estética Rosales',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Código para restablecer tu contraseña</h2>
        <p>Hola ${name},</p>
        <p>Has solicitado restablecer tu contraseña. Ingresa el siguiente código en la aplicación para continuar:</p>
        <div style="text-align: center; margin: 20px 0;">
          <div style="display: inline-block; background: #fff3f0; padding: 12px 18px; border-radius: 6px; font-family: monospace; font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #b91c1c;">${code}</div>
        </div>
        <p>El código expira en 10 minutos. Si no solicitaste esto, ignora este correo.</p>
      </div>
    `
  }),
  approval: (email) => ({
    to: email,
    subject: 'Cuenta Aprobada - Clínica Estética Rosales',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">¡Tu cuenta ha sido aprobada!</h2>
        <p>Tu solicitud de registro ha sido revisada y aprobada por el administrador.</p>
        <p>Ahora puedes iniciar sesión en nuestro sistema:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${FRONTEND_URL}/login" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Iniciar Sesión
          </a>
        </div>
        <p>¡Bienvenido a Clínica Estética Rosales!</p>
      </div>
    `
  }),
  backupCodes: (email, codes) => ({
    to: email,
    subject: 'Códigos de Respaldo 2FA - Clínica Estética Rosales',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Códigos de Respaldo para 2FA</h2>
        <p>Aquí tienes tus códigos de respaldo para la autenticación en dos pasos:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <ul style="list-style: none; padding: 0;">
            ${codes.map(code => `<li style="margin: 10px 0; font-family: monospace; font-size: 18px; font-weight: bold;">${code}</li>`).join('')}
          </ul>
        </div>
        <p><strong style="color: #dc3545;">¡IMPORTANTE!</strong> Guárdalos en un lugar seguro. Cada código solo se puede usar una vez.</p>
      </div>
    `
  })
};

// Funciones de envío
async function sendVerificationEmail(email, token, name) {
  try {
    const mailOptions = templates.verification(email, token, name);
    await transporter.sendMail({ 
      from: `"Clínica Estética Rosales" <${process.env.SMTP_USER || 'clinicaesteticarosales@gmail.com'}>`,
      ...mailOptions
    });
    console.log(`Email de verificación enviado a: ${email}`);
    console.log(`URL de verificación: ${FRONTEND_URL}/email-verified?token=${token}`);
  } catch (error) {
    console.error('Error enviando email de verificación:', error);
    throw error;
  }
}

async function sendVerificationCodeEmail(email, code, name) {
  try {
    const mailOptions = templates.verificationCode(email, code, name);
    await transporter.sendMail({
      from: `"Clínica Estética Rosales" <${process.env.SMTP_USER || 'clinicaesteticarosales@gmail.com'}>`,
      ...mailOptions
    });
    console.log(`Código de verificación enviado a: ${email}`);
  } catch (error) {
    console.error('Error enviando código de verificación:', error);
    throw error;
  }
}

async function sendApprovalEmail(email) {
  try {
    const mailOptions = templates.approval(email);
    await transporter.sendMail({ 
      from: `"Clínica Estética Rosales" <${process.env.SMTP_USER || 'clinicaesteticarosales@gmail.com'}>`,
      ...mailOptions
    });
    console.log(`Email de aprobación enviado a: ${email}`);
  } catch (error) {
    console.error('Error enviando email de aprobación:', error);
    throw error;
  }
}

async function send2FABackupCodesEmail(email, codes) {
  try {
    const mailOptions = templates.backupCodes(email, codes);
    await transporter.sendMail({ 
      from: `"Clínica Estética Rosales" <${process.env.SMTP_USER || 'clinicaesteticarosales@gmail.com'}>`,
      ...mailOptions
    });
    console.log(`Email de códigos 2FA enviado a: ${email}`);
  } catch (error) {
    console.error('Error enviando email de códigos 2FA:', error);
    throw error;
  }
}

// Notificación de cambio de contraseña
async function sendPasswordChangeEmail(email, nombre) {
  try {
    await transporter.sendMail({
      from: `"Clínica Estética Rosales" <${process.env.SMTP_USER || 'clinicaesteticarosales@gmail.com'}>`,
      to: email,
      subject: 'Contraseña actualizada',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">¡Hola, ${nombre}!</h2>
          <p>Te notificamos que tu contraseña ha sido cambiada exitosamente.</p>
          <p>Si no realizaste este cambio, por favor contacta al soporte de inmediato.</p>
        </div>
      `
    });
    console.log(`Notificación de cambio de contraseña enviada a: ${email}`);
  } catch (error) {
    console.error('Error enviando notificación de cambio de contraseña:', error);
    throw error;
  }
}

// Envío de código 2FA por email
async function send2FAEmailCode(email, code, nombre) {
  try {
    await transporter.sendMail({
      from: `"Clínica Estética Rosales" <${process.env.SMTP_USER || 'clinicaesteticarosales@gmail.com'}>`,
      to: email,
      subject: 'Código de verificación 2FA - Clínica Estética Rosales',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">¡Hola, ${nombre}!</h2>
          <p>Has solicitado un código de verificación para completar tu inicio de sesión.</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; display: inline-block;">
              <h3 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 5px;">${code}</h3>
            </div>
          </div>
          <p><strong>Importante:</strong></p>
          <ul>
            <li>Este código expira en 10 minutos</li>
            <li>No compartas este código con nadie</li>
            <li>Si no solicitaste este código, ignora este email</li>
          </ul>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Este es un correo automático, por favor no respondas a este mensaje.
          </p>
        </div>
      `
    });
    console.log(`Código 2FA enviado por email a: ${email}`);
  } catch (error) {
    console.error('Error enviando código 2FA por email:', error);
    throw error;
  }
}

// Envío de código de restablecimiento de contraseña (OTP)
async function sendPasswordResetCodeEmail(email, code, nombre) {
  try {
    const mailOptions = templates.passwordResetCode(email, code, nombre);
    await transporter.sendMail({
      from: `"Clínica Estética Rosales" <${process.env.SMTP_USER || 'clinicaesteticarosales@gmail.com'}>`,
      ...mailOptions
    });
    console.log(`Código de restablecimiento enviado a: ${email}`);
  } catch (error) {
    console.error('Error enviando código de restablecimiento por email:', error);
    throw error;
  }
}

// Exportar todas las funciones
module.exports = { 
  sendResetEmail,
  sendVerificationEmail,
  sendApprovalEmail,
  send2FABackupCodesEmail,
  sendPasswordChangeEmail,
  send2FAEmailCode,
  sendPasswordResetCodeEmail,
  sendVerificationCodeEmail
};