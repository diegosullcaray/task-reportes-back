const cron = require('node-cron');
const ventasService = require('./ventas.service');
const logger = require('../../utils/logger');

const timezone = process.env.TZ_SCHEDULES || undefined;

/**
 * Inicializa las tareas programadas de ventas
 * Se ejecuta una sola vez al iniciar la aplicación
 */
function inicializarSchedules() {
  try {
    // ===== REPORTE DIARIO A LAS 8 AM =====
    cron.schedule('0 8 * * *', async () => {
      logger.info('⏰ [VENTAS] Ejecutando reporte diario programado (8 AM)');
      try {
        await ventasService.generarReporteDiario();
      } catch (error) {
        logger.error(`Error en schedule reporte diario: ${error.message}`);
      }
    }, { timezone });

    // ===== TOP 10 PRODUCTOS CADA LUNES A LAS 9 AM =====
    cron.schedule('0 9 * * 1', async () => {
      logger.info('⏰ [VENTAS] Ejecutando reporte top productos (lunes 9 AM)');
      try {
        await ventasService.generarTopProductos(30);
      } catch (error) {
        logger.error(`Error en schedule top productos: ${error.message}`);
      }
    }, { timezone });

    logger.info('✅ Schedules de ventas inicializados correctamente');
    logger.info('   - Reporte diario: Todos los días 8:00 AM');
    logger.info('   - Top productos: Lunes 9:00 AM');

  } catch (error) {
    logger.error(`Error inicializando schedules de ventas: ${error.message}`);
    throw error;
  }
}

module.exports = { inicializarSchedules };
