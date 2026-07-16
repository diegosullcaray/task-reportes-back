const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./config/swagger');
const db = require('./config/database');
const logger = require('./utils/logger');

// Importar controllers (tareas manuales vía HTTP)
const carteraHeredadaController = require('./modules/Reportes/cartera-heredada/cartera-heredada.controller');
const desembolsoCanalController = require('./modules/Reportes/desembolso-canal/desembolso-canal.controller');
const fondeoEstableController = require('./modules/Reportes/fondeo-estable/fondeo-estable.controller');
const controlCargasController = require('./modules/Validaciones/control-cargas/control-cargas.controller');

// Importar schedules (tareas programadas vía cron)
const { inicializarSchedules: carteraHeredadaSchedules } = require('./modules/Reportes/cartera-heredada/cartera-heredada.schedule');
const { inicializarSchedules: desembolsoCanalSchedules } = require('./modules/Reportes/desembolso-canal/desembolso-canal.schedule');
const { inicializarSchedules: fondeoEstableSchedules } = require('./modules/Reportes/fondeo-estable/fondeo-estable.schedule');

const app = express();

// ============== MIDDLEWARES ==============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ============== DOCUMENTACIÓN SWAGGER ==============
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
  customSiteTitle: 'Backend de Reportes - API Docs'
}));

// ============== RUTAS REPORTES MENSUALES ==============
// Body opcional en todas: { "fecha": "20260630" } — por defecto fin del mes anterior

app.post('/api/reportes/cartera-heredada/generar-ahora', (req, res) =>
  carteraHeredadaController.generarAhora(req, res)
);

app.post('/api/reportes/desembolso-canal/generar-ahora', (req, res) =>
  desembolsoCanalController.generarAhora(req, res)
);

app.post('/api/reportes/fondeo-estable/generar-ahora', (req, res) =>
  fondeoEstableController.generarAhora(req, res)
);

// ============== RUTAS VALIDACIONES Y CONTROL DE CARGAS ==============

/**
 * @swagger
 * /api/validaciones/control-cargas:
 * get:
 * summary: Obtiene el estado de las cargas de datos
 * description: Retorna un reporte en tiempo real detallando qué tareas están pendientes, su estado actual y valida si las carteras activas y pasivas ya finalizaron.
 * tags:
 * - Validaciones
 * responses:
 * 200:
 * description: Reporte generado correctamente.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success:
 * type: boolean
 * resumenCritico:
 * type: object
 * totales:
 * type: object
 * procesosPendientes:
 * type: array
 * procesosFinalizados:
 * type: array
 * 500:
 * description: Error interno del servidor al procesar las validaciones.
 */
app.get('/api/validaciones/control-cargas', (req, res) =>
  controlCargasController.obtenerEstado(req, res)
);

// ============== HEALTH CHECK ==============
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    baseDatos: db.estado,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/info', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  res.json({
    nombre: 'Backend de Reportes',
    version: '2.0.0',
    ambiente: process.env.NODE_ENV,
    documentacion: `${baseUrl}/api-docs`,
    baseDatos: db.estado,
    reportes: {
      carteraHeredada: {
        descripcion: 'Cartera Heredada PDM - Stock mensual (Servidor 213, requiere cubo y PDM completos)',
        endpoint: 'POST /api/reportes/cartera-heredada/generar-ahora',
        link: `${baseUrl}/api/reportes/cartera-heredada/generar-ahora`,
        schedule: 'Día 2 de cada mes 9:00 AM'
      },
      desembolsoCanal: {
        descripcion: 'Desembolsos por canal (BT/CT) al cierre de mes',
        endpoint: 'POST /api/reportes/desembolso-canal/generar-ahora',
        link: `${baseUrl}/api/reportes/desembolso-canal/generar-ahora`,
        schedule: 'Día 1 de cada mes 2:30 PM'
      },
      fondeoEstable: {
        descripcion: 'Saldo de fondeo estable al cierre de mes',
        endpoint: 'POST /api/reportes/fondeo-estable/generar-ahora',
        link: `${baseUrl}/api/reportes/fondeo-estable/generar-ahora`,
        schedule: 'Día 1 de cada mes 9:00 AM'
      }
    },
    validaciones: {
      controlCargas: {
        descripcion: 'Control y verificación del estado de las cargas en el servidor de Base de Datos (Activas, Pasivas, etc.)',
        endpoint: 'GET /api/validaciones/control-cargas',
        link: `${baseUrl}/api/validaciones/control-cargas`
      }
    }
  });
});

// ============== INICIALIZAR SCHEDULES ==============
logger.info('🔄 Inicializando tareas programadas...');
carteraHeredadaSchedules();
desembolsoCanalSchedules();
fondeoEstableSchedules();
logger.info('✅ Todas las tareas programadas cargadas correctamente');

// ============== 404 ==============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.path
  });
});

// ============== MANEJO DE ERRORES ==============
app.use((err, req, res, next) => {
  logger.error(`Error no capturado: ${err.message}`);

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;