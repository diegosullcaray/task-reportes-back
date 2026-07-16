const { inicializarSchedules: controlCargasSchedules } = require('./control-cargas/control-cargas.schedule');

/**
 * Inicializa las tareas cron del módulo de validaciones.
 */
function inicializarSchedules() {
  controlCargasSchedules();
}

module.exports = { inicializarSchedules };
