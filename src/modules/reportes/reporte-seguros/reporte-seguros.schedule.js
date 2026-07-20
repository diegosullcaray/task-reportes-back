const cron = require('node-cron');
const reporteSegurosService = require('./reporte-seguros.service');
const logger = require('../../../infrastructure/logging/logger');

const timezone = process.env.TZ_SCHEDULES || undefined;

/**
 * Tarea programada: Utilizas Seguros (Giovani)
 *
 * Se ejecuta el día 4 de cada mes a las 11:00 AM con la fecha de cierre del
 * mes que acaba de terminar.
 */
function inicializarSchedules() {
  cron.schedule('0 11 4 * *', async () => {
    logger.info('⏰ [UTILIZAS SEGUROS] Ejecutando reporte mensual programado (día 4, 11:00 AM)');
    try {
      await reporteSegurosService.generarReporte();
    } catch (error) {
      logger.error(`Error en schedule Utilizas Seguros: ${error.message}`);
    }
  }, { timezone });

  logger.info('✅ Schedule Utilizas Seguros: día 4 de cada mes 11:00 AM');
}

module.exports = { inicializarSchedules };
