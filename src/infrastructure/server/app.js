const express = require('express');
const applyMiddlewares = require('./middlewares');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./errorHandler');
const { inicializarSchedules } = require('../../modules/schedules');
const logger = require('../logging/logger');

const app = express();

// ============== MIDDLEWARES ==============
applyMiddlewares(app);

// ============== RUTAS ==============
// Módulos (routers), Swagger (/api-docs) y utilidad (/health, /api/info)
// viven en infrastructure/server/routes.js, infrastructure/documentation y
// infrastructure/monitoring — ver ese archivo para el detalle de montaje.
app.use(routes);

// ============== TAREAS PROGRAMADAS ==============
inicializarSchedules();

// ============== 404 Y MANEJO DE ERRORES ==============
app.use(notFoundHandler);
app.use(errorHandler);

logger.debug('App Express inicializada');

module.exports = app;
