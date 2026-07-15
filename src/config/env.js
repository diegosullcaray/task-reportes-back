require('dotenv').config();

const env = {
  db: {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    encryption: process.env.DB_ENCRYPTION === 'true',
    trustCertificate: process.env.DB_TRUST_CERTIFICATE === 'true',
    username: process.env.DB_USERNAME || undefined,
    password: process.env.DB_PASSWORD || undefined
  },
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    firmaNombre: process.env.EMAIL_FIRMA_NOMBRE,
    firmaCargo: process.env.EMAIL_FIRMA_CARGO
  },
  app: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  schedules: {
    timezone: process.env.TZ_SCHEDULES || undefined
  },
  paths: {
    excelOutput: process.env.EXCEL_OUTPUT_PATH || './xlsx_output',
    logs: process.env.LOG_PATH || './logs'
  }
};

// Validar que existan variables críticas
const requeridas = ['DB_SERVER', 'DB_DATABASE', 'EMAIL_USER', 'EMAIL_PASSWORD'];
const faltantes = requeridas.filter(v => !process.env[v]);

if (faltantes.length > 0) {
  console.error('❌ Variables de entorno requeridas no encontradas:');
  console.error(faltantes.join(', '));
  console.error('Crear archivo .env con los valores necesarios (ver .env.example)');
  process.exit(1);
}

module.exports = env;
