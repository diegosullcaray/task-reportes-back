const { inicializarSchedules: carteraHeredadaSchedules } = require('./cartera-heredada/cartera-heredada.schedule');
const { inicializarSchedules: desembolsoCanalSchedules } = require('./desembolso-canal/desembolso-canal.schedule');
const { inicializarSchedules: fondeoEstableSchedules } = require('./fondeo-estable/fondeo-estable.schedule');
const { inicializarSchedules: ratioCESchedules } = require('./ratio-ce/ratio-ce.schedule');
const { inicializarSchedules: reporteGiancarloSchedules } = require('./reporte-giancarlo/reporte-giancarlo.schedule');
const { inicializarSchedules: saldoMedioVigenteSchedules } = require('./saldo-medio-vigente/saldo-medio-vigente.schedule');
const { inicializarSchedules: saldoPuntualMedioSchedules } = require('./saldo-puntual-medio/saldo-puntual-medio.schedule');
const { inicializarSchedules: saldoVigenteAgroSchedules } = require('./saldo-vigente-agro/saldo-vigente-agro.schedule');
const { inicializarSchedules: reporteSegurosSchedules } = require('./reporte-seguros/reporte-seguros.schedule');

/**
 * Inicializa las tareas cron de todos los reportes mensuales.
 */
function inicializarSchedules() {
  carteraHeredadaSchedules();
  desembolsoCanalSchedules();
  fondeoEstableSchedules();
  ratioCESchedules();
  reporteGiancarloSchedules();
  saldoMedioVigenteSchedules();
  saldoPuntualMedioSchedules();
  saldoVigenteAgroSchedules();
  reporteSegurosSchedules();
}

module.exports = { inicializarSchedules };
