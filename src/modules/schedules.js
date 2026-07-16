const logger = require('../infrastructure/logging/logger');
const { inicializarSchedules: reportesSchedules } = require('./reportes/reportes.schedules');
const { inicializarSchedules: validacionesSchedules } = require('./validaciones/validaciones.schedules');

/**
 * Punto único de arranque de todas las tareas programadas (cron) de la app:
 * reportes mensuales + validaciones periódicas. Lo invoca infrastructure/server/app.js.
 */
function inicializarSchedules() {
  logger.info('🔄 Inicializando tareas programadas...');
  reportesSchedules();
  validacionesSchedules();
  logger.info('✅ Todas las tareas programadas cargadas correctamente');
}

module.exports = { inicializarSchedules };
