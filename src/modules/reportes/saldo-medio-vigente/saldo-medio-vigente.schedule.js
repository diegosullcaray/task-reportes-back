const cron = require('node-cron');
const saldoMedioVigenteService = require('./saldo-medio-vigente.service');
const logger = require('../../../infrastructure/logging/logger');

const timezone = process.env.TZ_SCHEDULES || undefined;

/**
 * Tarea programada: Saldo Medio Vigente (Diana)
 *
 * Se ejecuta el día 3 de cada mes a las 10:00 AM con la fecha de cierre del
 * mes que acaba de terminar.
 */
function inicializarSchedules() {
  cron.schedule('0 10 3 * *', async () => {
    logger.info('⏰ [SALDO MEDIO VIGENTE] Ejecutando reporte mensual programado (día 3, 10:00 AM)');
    try {
      await saldoMedioVigenteService.generarReporte();
    } catch (error) {
      logger.error(`Error en schedule Saldo Medio Vigente: ${error.message}`);
    }
  }, { timezone });

  logger.info('✅ Schedule Saldo Medio Vigente: día 3 de cada mes 10:00 AM');
}

module.exports = { inicializarSchedules };
