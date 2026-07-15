const cron = require('node-cron');
const fondeoEstableService = require('./fondeo-estable.service');
const logger = require('../../utils/logger');

const timezone = process.env.TZ_SCHEDULES || undefined;

/**
 * Tarea programada: Fondeo Estable
 *
 * Se ejecuta el día 1 de cada mes a las 9:00 AM con la fecha de cierre
 * del mes que acaba de terminar.
 */
function inicializarSchedules() {
  cron.schedule('0 9 1 * *', async () => {
    logger.info('⏰ [FONDEO ESTABLE] Ejecutando reporte mensual programado (día 1, 9:00 AM)');
    try {
      await fondeoEstableService.generarReporte();
    } catch (error) {
      logger.error(`Error en schedule fondeo estable: ${error.message}`);
    }
  }, { timezone });

  logger.info('✅ Schedule Fondeo Estable: día 1 de cada mes 9:00 AM');
}

module.exports = { inicializarSchedules };
