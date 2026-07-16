/**
 * Helpers para construir tablas HTML embebibles en correos (reportes que
 * envían el resultado directo en el cuerpo, sin adjunto Excel).
 */

/** Formatea un entero con separador de miles (es-PE). Ej. 12784 → "12,784" */
function formatearEntero(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n.toLocaleString('es-PE') : '';
}

/** Formatea un monto con 2 decimales y separador de miles. Ej. 1234.5 → "1,234.50" */
function formatearMonto(valor) {
  const n = Number(valor);
  return Number.isFinite(n)
    ? n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';
}

/**
 * Construye una tabla HTML simple con estilos inline (compatibles con Gmail).
 * @param {Object} opciones
 * @param {string} [opciones.titulo] - Título opcional encima de la tabla
 * @param {string[]} opciones.columnas - Encabezados de columna
 * @param {Array<Array<{valor: string, alineacion?: string, negrita?: boolean, fondo?: string, sangria?: boolean}>>} opciones.filas
 *   Cada fila es un array de celdas; cada celda define su valor y estilos opcionales.
 * @returns {string} HTML de la tabla
 */
function construirTablaHtml({ titulo, columnas, filas }) {
  const tituloHtml = titulo
    ? `<p style="font-weight: bold; color: #0072CE; margin: 18px 0 6px;">${titulo}</p>`
    : '';

  const thead = `
    <tr>
      ${columnas.map((c, i) => `
        <th style="background-color: #0072CE; color: #fff; font-weight: bold; padding: 6px 12px;
                   text-align: ${i === 0 ? 'left' : 'right'}; border: 1px solid #d0d0d0;">${c}</th>`).join('')}
    </tr>`;

  const tbody = filas.map(celdas => `
    <tr>
      ${celdas.map((celda, i) => {
        const alineacion = celda.alineacion || (i === 0 ? 'left' : 'right');
        const negrita = celda.negrita ? 'font-weight: bold;' : '';
        const fondo = celda.fondo ? `background-color: ${celda.fondo};` : '';
        const sangria = celda.sangria ? 'padding-left: 28px;' : 'padding-left: 12px;';
        return `<td style="padding: 5px 12px; text-align: ${alineacion}; border: 1px solid #d0d0d0; ${negrita} ${fondo} ${sangria}">${celda.valor}</td>`;
      }).join('')}
    </tr>`).join('');

  return `
    ${tituloHtml}
    <table cellpadding="0" cellspacing="0" border="0"
           style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 13px; color: #222; margin-bottom: 10px;">
      <thead>${thead}</thead>
      <tbody>${tbody}</tbody>
    </table>`;
}

module.exports = { formatearEntero, formatearMonto, construirTablaHtml };
