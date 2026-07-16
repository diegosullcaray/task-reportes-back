const cron = require('node-cron');
const ratioCEService = require('./ratio-ce.service');
const logger = require('../../../infrastructure/logging/logger');

const timezone = process.env.TZ_SCHEDULES || undefined;

/**
 * Tarea programada: Ratio CE, Clientes Nuevos y Migrantes
 *
 * Se ejecuta el día 3 de cada mes a las 9:00 AM con la fecha de cierre del
 * mes que acaba de terminar. Se corre después de cartera heredada (día 2)
 * porque también depende de que las cargas del cierre estén completas; si la
 * data aún no está lista, se puede relanzar con
 * POST /api/reportes/ratio-ce/generar-ahora
 */
function inicializarSchedules() {
  cron.schedule('0 9 3 * *', async () => {
    logger.info('⏰ [RATIO CE] Ejecutando reporte mensual programado (día 3, 9:00 AM)');
    try {
      await ratioCEService.generarReporte();
    } catch (error) {
      logger.error(`Error en schedule ratio CE: ${error.message}`);
    }
  }, { timezone });

  logger.info('✅ Schedule Ratio CE, Clientes Nuevos y Migrantes: día 3 de cada mes 9:00 AM');
}

module.exports = { inicializarSchedules };
