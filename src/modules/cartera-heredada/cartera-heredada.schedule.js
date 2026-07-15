const cron = require('node-cron');
const carteraHeredadaService = require('./cartera-heredada.service');
const logger = require('../../utils/logger');

const timezone = process.env.TZ_SCHEDULES || undefined;

/**
 * Tarea programada: Cartera Heredada PDM
 *
 * Se ejecuta el día 2 de cada mes a las 9:00 AM (la query corre en el
 * Servidor 213 y necesita que la data del cubo y PDM estén completadas,
 * por eso no se lanza el día 1). Si la data aún no está lista, se puede
 * relanzar manualmente con POST /api/reportes/cartera-heredada/generar-ahora
 */
function inicializarSchedules() {
  cron.schedule('0 9 2 * *', async () => {
    logger.info('⏰ [CARTERA HEREDADA] Ejecutando reporte mensual programado (día 2, 9:00 AM)');
    try {
      await carteraHeredadaService.generarReporte();
    } catch (error) {
      logger.error(`Error en schedule cartera heredada: ${error.message}`);
    }
  }, { timezone });

  logger.info('✅ Schedule Cartera Heredada PDM: día 2 de cada mes 9:00 AM');
}

module.exports = { inicializarSchedules };
