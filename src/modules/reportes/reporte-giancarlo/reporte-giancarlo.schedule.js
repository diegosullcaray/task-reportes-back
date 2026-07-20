const cron = require('node-cron');
const reporteGiancarloService = require('./reporte-giancarlo.service');
const logger = require('../../../infrastructure/logging/logger');

const timezone = process.env.TZ_SCHEDULES || undefined;

/**
 * Tarea programada: Saca tu Garra (Reporte Giancarlo)
 *
 * Se ejecuta el día 2 de cada mes a las 10:00 AM con la fecha de cierre del
 * mes que acaba de terminar.
 */
function inicializarSchedules() {
  cron.schedule('0 10 2 * *', async () => {
    logger.info('⏰ [SACA TU GARRA] Ejecutando reporte mensual programado (día 2, 10:00 AM)');
    try {
      await reporteGiancarloService.generarReporte();
    } catch (error) {
      logger.error(`Error en schedule Saca tu Garra: ${error.message}`);
    }
  }, { timezone });

  logger.info('✅ Schedule Saca tu Garra: día 2 de cada mes 10:00 AM');
}

module.exports = { inicializarSchedules };
