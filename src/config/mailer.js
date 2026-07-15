const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Transportador Gmail (requiere contraseña de aplicación)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Envía email con reporte adjunto (opcional)
 * @param {string} asunto - Asunto del email
 * @param {string} contenidoHtml - HTML del cuerpo
 * @param {Object|null} archivo - {nombre, ruta}
 * @returns {Promise<boolean>}
 */
async function enviarEmail(asunto, contenidoHtml, archivo = null) {
  try {
    const destinatarios = [process.env.EMAIL_RECIPIENT];
    if (process.env.EMAIL_RECIPIENT_BACKUP) {
      destinatarios.push(process.env.EMAIL_RECIPIENT_BACKUP);
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destinatarios.join(', '),
      subject: asunto,
      html: contenidoHtml
    };

    if (archivo && archivo.ruta) {
      mailOptions.attachments = [{
        filename: archivo.nombre,
        path: archivo.ruta
      }];
    }

    const info = await transporter.sendMail(mailOptions);

    logger.info(`✓ Email enviado: ${asunto}`);
    logger.debug(`MessageID: ${info.messageId}`);

    return true;
  } catch (error) {
    logger.error(`✗ Error enviando email: ${error.message}`);
    return false;
  }
}

/**
 * Verifica conexión a Gmail
 * @returns {Promise<boolean>}
 */
async function verificarConexion() {
  try {
    await transporter.verify();
    logger.info('✓ Conexión Gmail verificada');
    return true;
  } catch (error) {
    logger.error(`✗ Error conexión Gmail: ${error.message}`);
    return false;
  }
}

module.exports = {
  transporter,
  enviarEmail,
  verificarConexion
};
