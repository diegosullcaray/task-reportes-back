const { inicializarSchedules: carteraHeredadaSchedules } = require('./cartera-heredada/cartera-heredada.schedule');
const { inicializarSchedules: desembolsoCanalSchedules } = require('./desembolso-canal/desembolso-canal.schedule');
const { inicializarSchedules: fondeoEstableSchedules } = require('./fondeo-estable/fondeo-estable.schedule');
const { inicializarSchedules: ratioCESchedules } = require('./ratio-ce/ratio-ce.schedule');

/**
 * Inicializa las tareas cron de todos los reportes mensuales.
 */
function inicializarSchedules() {
  carteraHeredadaSchedules();
  desembolsoCanalSchedules();
  fondeoEstableSchedules();
  ratioCESchedules();
}

module.exports = { inicializarSchedules };
