const cron = require('node-cron');
const saldoPuntualMedioService = require('./saldo-puntual-medio.service');
const logger = require('../../../infrastructure/logging/logger');

const timezone = process.env.TZ_SCHEDULES || undefined;

/**
 * Tarea programada: Saldo Puntual - Saldo Medio (Giovani)
 *
 * Se ejecuta el día 4 de cada mes a las 9:00 AM con la fecha de cierre del
 * mes que acaba de terminar.
 */
function inicializarSchedules() {
  cron.schedule('0 9 4 * *', async () => {
    logger.info('⏰ [SALDO PUNTUAL - SALDO MEDIO] Ejecutando reporte mensual programado (día 4, 9:00 AM)');
    try {
      await saldoPuntualMedioService.generarReporte();
    } catch (error) {
      logger.error(`Error en schedule Saldo Puntual - Saldo Medio: ${error.message}`);
    }
  }, { timezone });

  logger.info('✅ Schedule Saldo Puntual - Saldo Medio: día 4 de cada mes 9:00 AM');
}

module.exports = { inicializarSchedules };
