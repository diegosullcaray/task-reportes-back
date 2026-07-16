/**
 * Utilidades de fechas para los reportes mensuales.
 * Los reportes siempre se generan con fecha de cierre = fin del mes anterior.
 */

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Último día del mes anterior a la fecha dada
 * @param {Date} ahora
 * @returns {Date}
 */
function finDeMesAnterior(ahora = new Date()) {
  return new Date(ahora.getFullYear(), ahora.getMonth(), 0);
}

/**
 * Formatea una fecha como YYYYMMDD (ej. 20260630)
 * @param {Date} fecha
 * @returns {string}
 */
function aYYYYMMDD(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Nombre del mes en español (ej. "Junio")
 * @param {Date} fecha
 * @returns {string}
 */
function nombreMes(fecha) {
  return MESES[fecha.getMonth()];
}

/**
 * Año corto de dos dígitos (ej. "26")
 * @param {Date} fecha
 * @returns {string}
 */
function anioCorto(fecha) {
  return String(fecha.getFullYear()).slice(-2);
}

/**
 * Parsea una fecha en formato YYYYMMDD o YYYY-MM-DD.
 * Devuelve null si es inválida.
 * @param {string} texto
 * @returns {Date|null}
 */
function parseFecha(texto) {
  if (typeof texto !== 'string') return null;

  const limpio = texto.replace(/-/g, '');
  if (!/^\d{8}$/.test(limpio)) return null;

  const y = Number(limpio.slice(0, 4));
  const m = Number(limpio.slice(4, 6));
  const d = Number(limpio.slice(6, 8));
  const fecha = new Date(y, m - 1, d);

  const valida = fecha.getFullYear() === y
    && fecha.getMonth() === m - 1
    && fecha.getDate() === d;

  return valida ? fecha : null;
}

module.exports = {
  finDeMesAnterior,
  aYYYYMMDD,
  nombreMes,
  anioCorto,
  parseFecha
};
