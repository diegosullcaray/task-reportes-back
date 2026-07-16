const logger = require('../../infrastructure/logging/logger');
const { inicializarSchedules: carteraHeredadaSchedules } = require('./cartera-heredada/cartera-heredada.schedule');
const { inicializarSchedules: desembolsoCanalSchedules } = require('./desembolso-canal/desembolso-canal.schedule');
const { inicializarSchedules: fondeoEstableSchedules } = require('./fondeo-estable/fondeo-estable.schedule');
const { inicializarSchedules: ratioCESchedules } = require('./ratio-ce/ratio-ce.schedule');

/**
 * Inicializa las tareas cron de todos los reportes mensuales.
 */
function inicializarSchedules() {
  logger.info('🔄 Inicializando tareas programadas...');
  carteraHeredadaSchedules();
  desembolsoCanalSchedules();
  fondeoEstableSchedules();
  ratioCESchedules();
  logger.info('✅ Todas las tareas programadas cargadas correctamente');
}

module.exports = { inicializarSchedules };
