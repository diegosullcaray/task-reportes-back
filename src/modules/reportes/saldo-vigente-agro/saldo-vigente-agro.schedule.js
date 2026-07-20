const cron = require('node-cron');
const saldoVigenteAgroService = require('./saldo-vigente-agro.service');
const logger = require('../../../infrastructure/logging/logger');

const timezone = process.env.TZ_SCHEDULES || undefined;

/**
 * Tarea programada: Saldo Vigente - Producto Agro (Giovani)
 *
 * Se ejecuta el día 4 de cada mes a las 10:00 AM con la fecha de cierre del
 * mes que acaba de terminar.
 */
function inicializarSchedules() {
  cron.schedule('0 10 4 * *', async () => {
    logger.info('⏰ [SALDO VIGENTE AGRO] Ejecutando reporte mensual programado (día 4, 10:00 AM)');
    try {
      await saldoVigenteAgroService.generarReporte();
    } catch (error) {
      logger.error(`Error en schedule Saldo Vigente Agro: ${error.message}`);
    }
  }, { timezone });

  logger.info('✅ Schedule Saldo Vigente Agro: día 4 de cada mes 10:00 AM');
}

module.exports = { inicializarSchedules };
