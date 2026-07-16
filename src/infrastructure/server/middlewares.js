const express = require('express');
const compression = require('compression');
const securityMiddleware = require('../security/security.middleware');
const { apiLimiter } = require('../rate-limit/RateLimiter');
const requestLogger = require('./requestLogger.middleware');

/**
 * Middlewares globales de la app, en orden: seguridad (helmet/cors) →
 * compresión → parseo de body → rate limit de /api → logging de requests.
 */
function applyMiddlewares(app) {
  app.use(...securityMiddleware());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api', apiLimiter);
  app.use(requestLogger);
}

module.exports = applyMiddlewares;
