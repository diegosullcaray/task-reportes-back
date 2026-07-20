const { Router } = require('express');
const db = require('../database/database');

const router = Router();

/**
 * GET /health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    baseDatos: db.estado,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * GET /api/info
 */
router.get('/api/info', (req, res) => {
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
      },
      ratioCE: {
        descripcion: 'Ratio CE, Clientes Nuevos y Migrantes al cierre de mes (resultado en el cuerpo del correo, sin Excel)',
        endpoint: 'POST /api/reportes/ratio-ce/generar-ahora',
        link: `${baseUrl}/api/reportes/ratio-ce/generar-ahora`,
        schedule: 'Día 3 de cada mes 9:00 AM'
      },
      reporteGiancarlo: {
        descripcion: 'Saca tu Garra: variación de saldo vigente, productividad y ratios de recuperación por asesor',
        endpoint: 'POST /api/reportes/reporte-giancarlo/generar-ahora',
        link: `${baseUrl}/api/reportes/reporte-giancarlo/generar-ahora`,
        schedule: 'Día 2 de cada mes 10:00 AM'
      },
      saldoMedioVigente: {
        descripcion: 'Saldo medio vigente al cierre de mes (resultado en el cuerpo del correo, sin Excel)',
        endpoint: 'POST /api/reportes/saldo-medio-vigente/generar-ahora',
        link: `${baseUrl}/api/reportes/saldo-medio-vigente/generar-ahora`,
        schedule: 'Día 3 de cada mes 10:00 AM'
      },
      saldoPuntualMedio: {
        descripcion: 'Saldo puntual y saldo medio por agencia y producto al cierre de mes (Excel con 2 hojas)',
        endpoint: 'POST /api/reportes/saldo-puntual-medio/generar-ahora',
        link: `${baseUrl}/api/reportes/saldo-puntual-medio/generar-ahora`,
        schedule: 'Día 4 de cada mes 9:00 AM'
      },
      saldoVigenteAgro: {
        descripcion: 'Saldo vigente del producto Agro (actual, mes anterior y comparativo de cierre) por jerarquía comercial (Excel con 3 hojas)',
        endpoint: 'POST /api/reportes/saldo-vigente-agro/generar-ahora',
        link: `${baseUrl}/api/reportes/saldo-vigente-agro/generar-ahora`,
        schedule: 'Día 4 de cada mes 10:00 AM'
      },
      reporteSeguros: {
        descripcion: 'Utilizas Seguros: penetración de seguros por producto y nivel comercial al cierre de mes',
        endpoint: 'POST /api/reportes/reporte-seguros/generar-ahora',
        link: `${baseUrl}/api/reportes/reporte-seguros/generar-ahora`,
        schedule: 'Día 4 de cada mes 11:00 AM'
      }
    },
    validaciones: {
      controlCargas: {
        descripcion: 'Control y verificación del estado de las cargas en el servidor de Base de Datos (Activas, Pasivas, etc.). Notifica el resultado a Google Chat.',
        endpoint: 'GET /api/validaciones/control-cargas',
        link: `${baseUrl}/api/validaciones/control-cargas`,
        schedule: `Automático cada 5 minutos (${process.env.CONTROL_CARGAS_CRON || '*/5 * * * *'}) → Google Chat`
      }
    }
  });
});

module.exports = router;
