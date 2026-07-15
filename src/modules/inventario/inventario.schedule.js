const cron = require('node-cron');
const inventarioService = require('./inventario.service');
const logger = require('../../utils/logger');

const timezone = process.env.TZ_SCHEDULES || undefined;

/**
 * Inicializa las tareas programadas de inventario
 * Se ejecuta una sola vez al iniciar la aplicación
 */
function inicializarSchedules() {
  try {
    // ===== ALERTA DE STOCK BAJO TODOS LOS DÍAS A LAS 7:30 AM =====
    cron.schedule('30 7 * * *', async () => {
      logger.info('⏰ [INVENTARIO] Ejecutando alerta de stock bajo (7:30 AM)');
      try {
        await inventarioService.generarReporteStockBajo();
      } catch (error) {
        logger.error(`Error en schedule stock bajo: ${error.message}`);
      }
    }, { timezone });

    // ===== INVENTARIO TOTAL CADA VIERNES A LAS 5 PM =====
    cron.schedule('0 17 * * 5', async () => {
      logger.info('⏰ [INVENTARIO] Ejecutando reporte inventario total (viernes 5 PM)');
      try {
        await inventarioService.generarReporteTotal();
      } catch (error) {
        logger.error(`Error en schedule inventario total: ${error.message}`);
      }
    }, { timezone });

    logger.info('✅ Schedules de inventario inicializados correctamente');
    logger.info('   - Alerta stock bajo: Todos los días 7:30 AM');
    logger.info('   - Inventario total: Viernes 5:00 PM');

  } catch (error) {
    logger.error(`Error inicializando schedules de inventario: ${error.message}`);
    throw error;
  }
}

module.exports = { inicializarSchedules };
