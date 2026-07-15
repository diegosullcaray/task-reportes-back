/**
 * Plantilla HTML corporativa para los correos de reportes.
 * Firma configurable vía EMAIL_FIRMA_NOMBRE / EMAIL_FIRMA_CARGO.
 */

const FIRMA_NOMBRE = process.env.EMAIL_FIRMA_NOMBRE || 'Diego Denilson Sullcaray Ramos';
const FIRMA_CARGO = process.env.EMAIL_FIRMA_CARGO || 'Analista de Sistema de la Información y Gestión';
const FIRMA_DIRECCION = 'Las Begonias 441 oficina 238C, San Isidro, Lima';
const FIRMA_WEB = 'www.confianza.pe';

/**
 * Genera el cuerpo HTML estándar de un correo de reporte
 * @param {string} saludo - Ej. "Estimado Alvaro," / "Estimados,"
 * @param {string} [mensaje] - Cuerpo del mensaje
 * @returns {string} HTML del email
 */
function plantillaCorreoReporte(saludo, mensaje = 'se le adjunta lo solicitado') {
  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">
      <p>${saludo}<br>${mensaje}</p>

      <p>--<br>Saludos,</p>

      <p style="margin: 0;">
        <strong style="color: #0072CE;">${FIRMA_NOMBRE}</strong><br>
        <strong>${FIRMA_CARGO}</strong><br>
        <span style="color: #0072CE;">${FIRMA_DIRECCION}</span><br>
        <a href="https://${FIRMA_WEB}" style="color: #0072CE; font-weight: bold;">${FIRMA_WEB}</a>
      </p>
    </div>
  `;
}

module.exports = { plantillaCorreoReporte };
