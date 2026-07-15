require('./config/env'); // Cargar y validar .env antes que todo
const os = require('os');
const db = require('./config/database');
const { verificarConexion: verificarCorreo } = require('./config/mailer');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // 0.0.0.0 = accesible desde la red por la IP de la máquina

/**
 * IP local (IPv4, no interna) para mostrar los links accesibles desde la red
 */
function obtenerIpLocal() {
  const interfaces = Object.values(os.networkInterfaces()).flat();
  const externa = interfaces.find(i => i && i.family === 'IPv4' && !i.internal);
  return externa ? externa.address : 'localhost';
}

async function iniciar() {
  // 1. Verificar conexión a la base de datos ANTES de todo
  const modoAuth = process.env.DB_DOMAIN
    ? `Windows Auth: ${process.env.DB_DOMAIN}\\${process.env.DB_USERNAME}`
    : 'SQL Auth';

  logger.info(`🔍 Verificando conexión a SQL Server (${process.env.DB_SERVER} / ${process.env.DB_DATABASE}, ${modoAuth})...`);
  const dbOk = await db.verificarConexion();

  if (!dbOk) {
    logger.warn('⚠️ El servidor arrancará SIN conexión a la base de datos.');
    logger.warn('   Los reportes fallarán hasta que la BD esté disponible (reintentan en cada ejecución).');
  }

  // 2. Verificar conexión al correo (los reportes se envían por Gmail/Workspace)
  logger.info(`🔍 Verificando conexión de correo (${process.env.EMAIL_USER})...`);
  const correoOk = await verificarCorreo();

  if (!correoOk) {
    logger.warn('⚠️ No se pudo verificar el correo: los reportes se generarán pero el envío fallará.');
    logger.warn('   • Si el error es "Invalid login": EMAIL_PASSWORD debe ser contraseña de aplicación de 16 dígitos.');
    logger.warn('   • Si el error es ENETUNREACH/ETIMEDOUT: la red/firewall bloquea el SMTP; probar EMAIL_PORT=587');
    logger.warn('     o pedir a TI que permita salida a smtp.gmail.com (puertos 465/587).');
  }

  // 3. Cargar la app (inicializa rutas y tareas programadas) y levantar servidor HTTP
  const app = require('./app');
  const server = app.listen(PORT, HOST, () => {
    const BASE_URL = `http://${obtenerIpLocal()}:${PORT}`;

    logger.info(`
╔═══════════════════════════════════════════════════════════════════════╗
║  🚀 Backend de Reportes Iniciado                                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║  🗄️  Base de datos: ${dbOk ? '✓ CONECTADA' : '✗ SIN CONEXIÓN'} (${process.env.DB_SERVER})
║  📧 Correo: ${correoOk ? '✓ VERIFICADO' : '✗ ERROR'} (${process.env.EMAIL_USER})
║  📍 Escuchando en: ${HOST}:${PORT}
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
