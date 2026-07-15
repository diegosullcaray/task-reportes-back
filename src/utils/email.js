/**
 * Plantillas HTML compartidas para los emails de reportes
 */

/**
 * Genera el HTML estándar de un reporte
 * @param {string} titulo - Título del reporte
 * @param {Array<{label: string, valor: string|number}>} cajas - Datos resumen
 * @returns {string} HTML del email
 */
function plantillaReporte(titulo, cajas = []) {
  const cajasHtml = cajas.map(caja => `
                <div class="info-box">
                  <strong>${caja.label}</strong>
                  <span>${caja.valor}</span>
                </div>`).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { background: white; padding: 20px; border-radius: 5px; max-width: 600px; margin: 20px auto; }
          h2 { color: #4285F4; border-bottom: 3px solid #4285F4; padding-bottom: 10px; }
          .info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .info-box { background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #4285F4; }
          .info-box strong { color: #333; display: block; }
          .info-box span { color: #666; }
          .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${titulo}</h2>

          <div class="info">${cajasHtml}
          </div>

          <p>El archivo Excel con el detalle completo está adjunto.</p>

          <div class="footer">
            <p>Reporte automático generado por Backend de Reportes</p>
            <p>No responder a este correo</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Caja de fecha/hora estándar para los resúmenes
 */
function cajasFechaHora() {
  return [
    {
      label: '📅 Fecha',
      valor: new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
    },
    {
      label: '⏰ Hora Reporte',
      valor: new Date().toLocaleTimeString('es-ES')
    }
  ];
}

module.exports = { plantillaReporte, cajasFechaHora };
