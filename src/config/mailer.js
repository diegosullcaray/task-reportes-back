const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Transportador Gmail / Google Workspace (requiere contraseña de aplicación)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Envía email con reporte adjunto
 * @param {Object} opciones
 * @param {string} opciones.asunto - Asunto del email
 * @param {string} opciones.contenidoHtml - HTML del cuerpo
 * @param {string[]} opciones.para - Destinatarios principales
 * @param {string[]} [opciones.cc] - Destinatarios en copia
 * @param {Object|null} [opciones.archivo] - {nombre, ruta}
 * @returns {Promise<boolean>}
 */
async function enviarEmail({ asunto, contenidoHtml, para, cc = [], archivo = null }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: para.join(', '),
      subject: asunto,
      html: contenidoHtml
    };

    if (cc.length > 0) {
      mailOptions.cc = cc.join(', ');
    }

    if (archivo && archivo.ruta) {
      mailOptions.attachments = [{
        filename: archivo.nombre,
        path: archivo.ruta
      }];
    }

    const info = await transporter.sendMail(mailOptions);

    logger.info(`✓ Email enviado: ${asunto} → ${mailOptions.to}${cc.length ? ` (cc: ${mailOptions.cc})` : ''}`);
    logger.debug(`MessageID: ${info.messageId}`);

    return true;
  } catch (error) {
    logger.error(`✗ Error enviando email "${asunto}": ${error.message}`);
    return false;
  }
}

/**
 * Verifica conexión al servidor de correo
 * @returns {Promise<boolean>}
 */
async function verificarConexion() {
  try {
    await transporter.verify();
    logger.info('✓ Conexión de correo verificada');
    return true;
  } catch (error) {
    logger.error(`✗ Error conexión de correo: ${error.message}`);
    return false;
  }
}

module.exports = {
  transporter,
  enviarEmail,
  verificarConexion
};
