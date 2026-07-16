const cron = require('node-cron');
const desembolsoCanalService = require('./desembolso-canal.service');
const logger = require('../../../infrastructure/logging/logger');

const timezone = process.env.TZ_SCHEDULES || undefined;

/**
 * Tarea programada: Desembolso Canal
 *
 * Se ejecuta el día 1 de cada mes a las 2:30 PM (en el correo de ejemplo
 * el reporte se envió el día 1 a las 14:23), con la fecha de cierre del
 * mes que acaba de terminar.
 */
function inicializarSchedules() {
  cron.schedule('30 14 1 * *', async () => {
    logger.info('⏰ [DESEMBOLSO CANAL] Ejecutando reporte mensual programado (día 1, 2:30 PM)');
    try {
      await desembolsoCanalService.generarReporte();
    } catch (error) {
      logger.error(`Error en schedule desembolso canal: ${error.message}`);
    }
  }, { timezone });

  logger.info('✅ Schedule Desembolso Canal: día 1 de cada mes 2:30 PM');
}

module.exports = { inicializarSchedules };
