const https = require('https');
const { URL } = require('url');
const logger = require('../logging/logger');

/**
 * Notificaciones a un espacio de Google Chat vía webhook entrante
 * (Menú del espacio → Apps e integraciones → Webhooks → copiar URL).
 * Gratis con cualquier cuenta de Google Workspace, sin dependencias nuevas
 * (usa https nativo de Node en vez de axios/node-fetch).
 *
 * Nunca lanza excepción: si no hay webhook configurado o falla el envío,
 * solo loguea y devuelve { enviado: false }, para no romper el flujo que
 * la llama (ej. la validación de control de cargas no debe fallar por un
 * problema de Chat).
 *
 * @param {string} texto - Mensaje de texto plano (Google Chat soporta *negrita*, _cursiva_, etc.)
 * @returns {Promise<{enviado: boolean, error?: string}>}
 */
function enviarNotificacionChat(texto) {
  const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL;

  return new Promise((resolve) => {
    if (!webhookUrl) {
      logger.warn('⚠️ GOOGLE_CHAT_WEBHOOK_URL no configurado: notificación de Chat omitida');
      return resolve({ enviado: false, error: 'GOOGLE_CHAT_WEBHOOK_URL no configurado' });
    }

    let url;
    try {
      url = new URL(webhookUrl);
    } catch (error) {
      logger.error(`❌ GOOGLE_CHAT_WEBHOOK_URL inválido: ${error.message}`);
      return resolve({ enviado: false, error: 'GOOGLE_CHAT_WEBHOOK_URL inválido' });
    }

    const body = JSON.stringify({ text: texto });

    const request = https.request({
      hostname: url.hostname,
      path: `${url.pathname}${url.search}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 10000
    }, (response) => {
      response.on('data', () => {});
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          logger.info('✅ Notificación enviada a Google Chat');
          resolve({ enviado: true });
        } else {
          logger.error(`❌ Google Chat respondió ${response.statusCode}`);
          resolve({ enviado: false, error: `Google Chat respondió HTTP ${response.statusCode}` });
        }
      });
    });

    request.on('timeout', () => request.destroy(new Error('Timeout esperando respuesta de Google Chat')));

    request.on('error', (error) => {
      logger.error(`❌ Error enviando notificación a Google Chat: ${error.message}`);
      resolve({ enviado: false, error: error.message });
    });

    request.write(body);
    request.end();
  });
}

module.exports = { enviarNotificacionChat };
