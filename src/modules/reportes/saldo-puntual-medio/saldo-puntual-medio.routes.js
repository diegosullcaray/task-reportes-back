const { Router } = require('express');
const asyncHandler = require('../../../shared/http/asyncHandler');
const { validarFechaCierre } = require('../../../shared/validators/fecha.validator');
const { reportesLimiter } = require('../../../infrastructure/rate-limit/RateLimiter');
const saldoPuntualMedioController = require('./saldo-puntual-medio.controller');

const router = Router();

/**
 * POST /api/reportes/saldo-puntual-medio/generar-ahora
 * Body opcional: { "fecha": "20260630" } (o "2026-06-30"); por defecto fin del mes anterior
 */
router.post(
  '/generar-ahora',
  reportesLimiter,
  validarFechaCierre,
  asyncHandler((req, res) => saldoPuntualMedioController.generarAhora(req, res))
);

module.exports = router;
