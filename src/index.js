require('./config/env'); // Cargar y validar .env antes que todo
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

// Iniciar servidor
const server = app.listen(PORT, () => {
  logger.info(`
╔════════════════════════════════════════╗
║  🚀 Backend de Reportes Iniciado       ║
╠════════════════════════════════════════╣
║  📍 Puerto: ${PORT}
║  🌍 URL: http://localhost:${PORT}
║  📊 API: http://localhost:${PORT}/api/info
║  ❤️  Health: http://localhost:${PORT}/health
╚════════════════════════════════════════╝
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

// Manejo de promesas rechazadas no capturadas
process.on('unhandledRejection', (reason) => {
  logger.error(`Promesa rechazada no manejada: ${reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Excepción no capturada: ${error.message}`);
  process.exit(1);
});
