const cron = require('node-cron');
const clientesService = require('./clientes.service');
const logger = require('../../utils/logger');

const timezone = process.env.TZ_SCHEDULES || undefined;

/**
 * Inicializa las tareas programadas de clientes
 * Se ejecuta una sola vez al iniciar la aplicación
 */
function inicializarSchedules() {
  try {
    // ===== CLIENTES NUEVOS CADA LUNES A LAS 8:30 AM =====
    cron.schedule('30 8 * * 1', async () => {
      logger.info('⏰ [CLIENTES] Ejecutando reporte clientes nuevos (lunes 8:30 AM)');
      try {
        await clientesService.generarReporteNuevos(7);
      } catch (error) {
        logger.error(`Error en schedule clientes nuevos: ${error.message}`);
      }
    }, { timezone });

    // ===== CLIENTES INACTIVOS EL DÍA 1 DE CADA MES A LAS 9 AM =====
    cron.schedule('0 9 1 * *', async () => {
      logger.info('⏰ [CLIENTES] Ejecutando reporte clientes inactivos (día 1, 9 AM)');
      try {
        await clientesService.generarReporteInactivos(30);
      } catch (error) {
        logger.error(`Error en schedule clientes inactivos: ${error.message}`);
      }
    }, { timezone });

    logger.info('✅ Schedules de clientes inicializados correctamente');
    logger.info('   - Clientes nuevos: Lunes 8:30 AM');
    logger.info('   - Clientes inactivos: Día 1 de cada mes 9:00 AM');

  } catch (error) {
    logger.error(`Error inicializando schedules de clientes: ${error.message}`);
    throw error;
  }
}

module.exports = { inicializarSchedules };
