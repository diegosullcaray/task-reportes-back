const { Router } = require('express');

const documentationRoutes = require('../documentation/documentation.routes');
const healthRoutes = require('../monitoring/health.routes');
const carteraHeredadaRoutes = require('../../modules/reportes/cartera-heredada/cartera-heredada.routes');
const desembolsoCanalRoutes = require('../../modules/reportes/desembolso-canal/desembolso-canal.routes');
const fondeoEstableRoutes = require('../../modules/reportes/fondeo-estable/fondeo-estable.routes');
const ratioCERoutes = require('../../modules/reportes/ratio-ce/ratio-ce.routes');
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

// ============== RUTAS VALIDACIONES Y CONTROL DE CARGAS ==============
router.use('/api/validaciones', controlCargasRoutes);

// ============== UTILIDAD (health, api/info) ==============
router.use(healthRoutes);

module.exports = router;
