const logger = require('../../infrastructure/logging/logger');
const { inicializarSchedules: carteraHeredadaSchedules } = require('./cartera-heredada/cartera-heredada.schedule');
const { inicializarSchedules: desembolsoCanalSchedules } = require('./desembolso-canal/desembolso-canal.schedule');
const { inicializarSchedules: fondeoEstableSchedules } = require('./fondeo-estable/fondeo-estable.schedule');

/**
 * Inicializa las tareas cron de todos los reportes mensuales.
 */
function inicializarSchedules() {
  logger.info('🔄 Inicializando tareas programadas...');
  carteraHeredadaSchedules();
  desembolsoCanalSchedules();
  fondeoEstableSchedules();
  logger.info('✅ Todas las tareas programadas cargadas correctamente');
}

module.exports = { inicializarSchedules };
