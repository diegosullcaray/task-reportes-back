const rateLimit = require('express-rate-limit');

const respuestaLimite = (req, res) => {
  res.status(429).json({
    success: false,
    error: 'Demasiadas solicitudes, intente nuevamente más tarde'
  });
};

/**
 * Límite global conservador para toda la API (no hay login: cualquiera con
 * la URL puede llamar los endpoints, así que el rate limit es la única
 * protección de borde contra abuso/loops accidentales).
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: respuestaLimite
});

/**
 * Límite estricto para endpoints costosos: disparan queries pesadas contra
 * SQL Server y envío de correo (generar-ahora de reportes, control de cargas).
 */
const reportesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: respuestaLimite
});

module.exports = { apiLimiter, reportesLimiter };
