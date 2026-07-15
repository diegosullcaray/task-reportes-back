const express = require('express');
const logger = require('./utils/logger');

// Importar controllers (tareas manuales vía HTTP)
const ventasController = require('./modules/ventas/ventas.controller');
const clientesController = require('./modules/clientes/clientes.controller');
const inventarioController = require('./modules/inventario/inventario.controller');

// Importar schedules (tareas programadas vía cron)
const { inicializarSchedules: ventasSchedules } = require('./modules/ventas/ventas.schedule');
const { inicializarSchedules: clientesSchedules } = require('./modules/clientes/clientes.schedule');
const { inicializarSchedules: inventarioSchedules } = require('./modules/inventario/inventario.schedule');

const app = express();

// ============== MIDDLEWARES ==============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ============== RUTAS VENTAS ==============
app.post('/api/reportes/ventas/generar-ahora', (req, res) =>
  ventasController.generarAhora(req, res)
);

app.post('/api/reportes/ventas/por-rango', (req, res) =>
  ventasController.generarPorRango(req, res)
);

app.get('/api/reportes/ventas/top-productos', (req, res) =>
  ventasController.obtenerTopProductos(req, res)
);

// ============== RUTAS CLIENTES ==============
app.post('/api/reportes/clientes/nuevos', (req, res) =>
  clientesController.generarNuevos(req, res)
);

app.get('/api/reportes/clientes/inactivos', (req, res) =>
  clientesController.generarInactivos(req, res)
);

app.post('/api/reportes/clientes/resumen', (req, res) =>
  clientesController.generarResumen(req, res)
);

// ============== RUTAS INVENTARIO ==============
app.post('/api/reportes/inventario/stock-bajo', (req, res) =>
  inventarioController.generarStockBajo(req, res)
);

app.get('/api/reportes/inventario/total', (req, res) =>
  inventarioController.generarTotal(req, res)
);

app.post('/api/reportes/inventario/movimientos', (req, res) =>
  inventarioController.generarMovimientos(req, res)
);

// ============== HEALTH CHECK ==============
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/info', (req, res) => {
  res.json({
    nombre: 'Backend de Reportes',
    version: '1.0.0',
    ambiente: process.env.NODE_ENV,
    reportes: {
      ventas: {
        endpoints: [
          'POST /api/reportes/ventas/generar-ahora',
          'POST /api/reportes/ventas/por-rango',
          'GET /api/reportes/ventas/top-productos'
        ],
        schedules: [
          'Reporte diario: todos los días 8:00 AM',
          'Top productos: lunes 9:00 AM'
        ]
      },
      clientes: {
        endpoints: [
          'POST /api/reportes/clientes/nuevos',
          'GET /api/reportes/clientes/inactivos',
          'POST /api/reportes/clientes/resumen'
        ],
        schedules: [
          'Clientes nuevos: lunes 8:30 AM',
          'Clientes inactivos: día 1 de cada mes 9:00 AM'
        ]
      },
      inventario: {
        endpoints: [
          'POST /api/reportes/inventario/stock-bajo',
          'GET /api/reportes/inventario/total',
          'POST /api/reportes/inventario/movimientos'
        ],
        schedules: [
          'Alerta stock bajo: todos los días 7:30 AM',
          'Inventario total: viernes 5:00 PM'
        ]
      }
    }
  });
});

// ============== INICIALIZAR SCHEDULES ==============
logger.info('🔄 Inicializando schedules automáticos...');
ventasSchedules();
clientesSchedules();
inventarioSchedules();
logger.info('✅ Todos los schedules cargados correctamente');

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
