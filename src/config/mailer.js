const nodemailer = require('nodemailer');
const dns = require('dns');
const logger = require('../utils/logger');

// Preferir IPv4: en redes corporativas sin ruta IPv6, Node intenta primero
// la IP v6 de Gmail y falla con "connect ENETUNREACH 2800:...:465"
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// Transportador Gmail / Google Workspace (requiere contraseña de aplicación).
// Si el firewall bloquea el puerto 465, probar EMAIL_PORT=587 (STARTTLS).
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT, 10) || 465;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // 465 = TLS directo; 587 = STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 60000
});

/**
 * Envía email con reporte adjunto. Loguea cada paso del proceso y
 * devuelve el detalle del envío (nunca lanza excepción).
 *
 * @param {Object} opciones
 * @param {string} opciones.asunto - Asunto del email
 * @param {string} opciones.contenidoHtml - HTML del cuerpo
 * @param {string[]} opciones.para - Destinatarios principales
 * @param {string[]} [opciones.cc] - Destinatarios en copia
 * @param {Object|null} [opciones.archivo] - {nombre, ruta}
 * @returns {Promise<{enviado: boolean, asunto: string, para: string, cc?: string, adjunto?: string, messageId?: string, error?: string}>}
 */
async function enviarEmail({ asunto, contenidoHtml, para, cc = [], archivo = null }) {
  const destinatarios = para.join(', ');
  const copias = cc.join(', ');

  const detalle = {
    asunto,
    para: destinatarios,
    ...(copias && { cc: copias }),
    ...(archivo && { adjunto: archivo.nombre })
  };

  try {
    logger.info(`📧 Enviando correo: "${asunto}"`);
    logger.info(`   De:      ${process.env.EMAIL_USER}`);
    logger.info(`   Para:    ${destinatarios}`);
    if (copias) logger.info(`   Cc:      ${copias}`);
    if (archivo) logger.info(`   Adjunto: ${archivo.nombre}`);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: destinatarios,
      subject: asunto,
      html: contenidoHtml
    };

    if (copias) {
      mailOptions.cc = copias;
    }

    if (archivo && archivo.ruta) {
      mailOptions.attachments = [{
        filename: archivo.nombre,
        path: archivo.ruta
      }];
    }

    const info = await transporter.sendMail(mailOptions);

    logger.info(`✅ Correo enviado correctamente (MessageID: ${info.messageId})`);
    if (info.accepted?.length) logger.info(`   Aceptado por el servidor para: ${info.accepted.join(', ')}`);
    if (info.rejected?.length) logger.warn(`   ⚠️ Rechazado para: ${info.rejected.join(', ')}`);

    return { enviado: true, messageId: info.messageId, ...detalle };
  } catch (error) {
    logger.error(`❌ Error enviando correo "${asunto}": ${error.message}`);
    return { enviado: false, error: error.message, ...detalle };
  }
}

/**
 * Verifica conexión al servidor de correo (con tiempo máximo de espera
 * para no bloquear el arranque si el SMTP no responde)
 * @param {number} [timeoutMs]
 * @returns {Promise<boolean>}
 */
async function verificarConexion(timeoutMs = 15000) {
  try {
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => setTimeout(
        () => reject(new Error(`sin respuesta del servidor de correo en ${timeoutMs / 1000}s`)),
        timeoutMs
      ))
    ]);
    logger.info(`✓ Conexión de correo verificada (${process.env.EMAIL_USER})`);
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
