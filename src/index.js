require('./config/env'); // Cargar y validar .env antes que todo
const db = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function iniciar() {
  // 1. Verificar conexión a la base de datos ANTES de todo
  logger.info(`🔍 Verificando conexión a SQL Server (${process.env.DB_SERVER} / ${process.env.DB_DATABASE})...`);
  const dbOk = await db.verificarConexion();

  if (!dbOk) {
    logger.warn('⚠️ El servidor arrancará SIN conexión a la base de datos.');
    logger.warn('   Los reportes fallarán hasta que la BD esté disponible (reintentan en cada ejecución).');
  }

  // 2. Cargar la app (inicializa rutas y tareas programadas) y levantar servidor HTTP
  const app = require('./app');
  const server = app.listen(PORT, () => {
    logger.info(`
╔═══════════════════════════════════════════════════════════════════════╗
║  🚀 Backend de Reportes Iniciado                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║  🗄️  Base de datos: ${dbOk ? '✓ CONECTADA' : '✗ SIN CONEXIÓN'}
║  📍 Puerto: ${PORT}
╠═══════════════════════════════════════════════════════════════════════╣
║  📖 Documentación Swagger (ejecutar endpoints desde el navegador):
║     ${BASE_URL}/api-docs
╠═══════════════════════════════════════════════════════════════════════╣
║  🔗 Links de las tareas manuales (POST):
║     • Cartera Heredada PDM:
║       ${BASE_URL}/api/reportes/cartera-heredada/generar-ahora
║     • Desembolso Canal:
║       ${BASE_URL}/api/reportes/desembolso-canal/generar-ahora
║     • Fondeo Estable:
║       ${BASE_URL}/api/reportes/fondeo-estable/generar-ahora
╠═══════════════════════════════════════════════════════════════════════╣
║  🔗 Utilidad (GET):
║     • Health:   ${BASE_URL}/health
║     • API Info: ${BASE_URL}/api/info
╚═══════════════════════════════════════════════════════════════════════╝
    `);
  });

  // Manejo de shutdown graceful
  process.on('SIGTERM', () => {
    logger.info('SIGTERM recibido. Cerrando servidor...');
    server.close(() => {
      logger.info('Servidor cerrado');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT recibido. Cerrando servidor...');
    server.close(() => {
      logger.info('Servidor cerrado');
      process.exit(0);
    });
  });
}

// Manejo de promesas rechazadas no capturadas
process.on('unhandledRejection', (reason) => {
  logger.error(`Promesa rechazada no manejada: ${reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Excepción no capturada: ${error.message}`);
  process.exit(1);
});

iniciar();
