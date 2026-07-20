const { Router } = require('express');

const documentationRoutes = require('../documentation/documentation.routes');
const healthRoutes = require('../monitoring/health.routes');
const carteraHeredadaRoutes = require('../../modules/reportes/cartera-heredada/cartera-heredada.routes');
const desembolsoCanalRoutes = require('../../modules/reportes/desembolso-canal/desembolso-canal.routes');
const fondeoEstableRoutes = require('../../modules/reportes/fondeo-estable/fondeo-estable.routes');
const ratioCERoutes = require('../../modules/reportes/ratio-ce/ratio-ce.routes');
const reporteGiancarloRoutes = require('../../modules/reportes/reporte-giancarlo/reporte-giancarlo.routes');
const saldoMedioVigenteRoutes = require('../../modules/reportes/saldo-medio-vigente/saldo-medio-vigente.routes');
const saldoPuntualMedioRoutes = require('../../modules/reportes/saldo-puntual-medio/saldo-puntual-medio.routes');
const saldoVigenteAgroRoutes = require('../../modules/reportes/saldo-vigente-agro/saldo-vigente-agro.routes');
const reporteSegurosRoutes = require('../../modules/reportes/reporte-seguros/reporte-seguros.routes');
const controlCargasRoutes = require('../../modules/validaciones/control-cargas/control-cargas.routes');

const router = Router();

// ============== DOCUMENTACIÓN SWAGGER ==============
router.use('/api-docs', documentationRoutes);

// ============== RUTAS REPORTES MENSUALES ==============
// Body opcional en todas: { "fecha": "20260630" } — por defecto fin del mes anterior
router.use('/api/reportes/cartera-heredada', carteraHeredadaRoutes);
router.use('/api/reportes/desembolso-canal', desembolsoCanalRoutes);
router.use('/api/reportes/fondeo-estable', fondeoEstableRoutes);
router.use('/api/reportes/ratio-ce', ratioCERoutes);
router.use('/api/reportes/reporte-giancarlo', reporteGiancarloRoutes);
router.use('/api/reportes/saldo-medio-vigente', saldoMedioVigenteRoutes);
router.use('/api/reportes/saldo-puntual-medio', saldoPuntualMedioRoutes);
router.use('/api/reportes/saldo-vigente-agro', saldoVigenteAgroRoutes);
router.use('/api/reportes/reporte-seguros', reporteSegurosRoutes);

// ============== RUTAS VALIDACIONES Y CONTROL DE CARGAS ==============
router.use('/api/validaciones', controlCargasRoutes);

// ============== UTILIDAD (health, api/info) ==============
router.use(healthRoutes);

module.exports = router;
