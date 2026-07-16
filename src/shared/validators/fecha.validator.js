const { parseFecha, finDeMesAnterior } = require('../utils/fechas');
const { ValidationError } = require('../errors');

/**
 * Valida el body.fecha (opcional) de las tareas manuales de reportes.
 * Si es válida (o no vino en el body) deja la fecha de cierre lista en
 * req.fechaCierre; si es inválida deja que asyncHandler/Express reenvíen
 * la ValidationError al errorHandler centralizado (400).
 */
function validarFechaCierre(req, res, next) {
  if (!req.body?.fecha) {
    req.fechaCierre = finDeMesAnterior();
    return next();
  }

  const fecha = parseFecha(req.body.fecha);
  if (!fecha) {
    return next(new ValidationError('Formato de fecha inválido (use YYYYMMDD o YYYY-MM-DD)'));
  }

  req.fechaCierre = fecha;
  next();
}

module.exports = { validarFechaCierre };
