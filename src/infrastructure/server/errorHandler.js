const logger = require('../logging/logger');

/**
 * Handler para rutas no registradas (debe montarse después de todas las rutas).
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.path
  });
}

/**
 * Manejo centralizado de errores (debe montarse al final, después de notFoundHandler).
 * Respeta err.statusCode de los errores de shared/errors (BaseError y subclases);
 * cualquier otro error no operacional cae a 500.
 */
function errorHandler(err, req, res, next) {
  logger.error(`Error no capturado: ${err.message}`, { stack: err.stack });

  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' && !err.isOperational
      ? 'Error interno del servidor'
      : err.message,
    timestamp: new Date().toISOString()
  });
}

module.exports = { notFoundHandler, errorHandler };
