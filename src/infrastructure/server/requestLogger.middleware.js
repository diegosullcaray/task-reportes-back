const logger = require('../logging/logger');

/**
 * Loguea método y path de cada request entrante.
 */
function requestLogger(req, res, next) {
  logger.info(`${req.method} ${req.path}`);
  next();
}

module.exports = requestLogger;
