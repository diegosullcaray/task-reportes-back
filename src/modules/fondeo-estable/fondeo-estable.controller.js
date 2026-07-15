const fondeoEstableService = require('./fondeo-estable.service');
const { parseFecha, finDeMesAnterior } = require('../../utils/fechas');
const logger = require('../../utils/logger');

class FondeoEstableController {
  /**
   * POST /api/reportes/fondeo-estable/generar-ahora
   * Body opcional: { "fecha": "20260630" } (o "2026-06-30"); por defecto fin del mes anterior
   */
  async generarAhora(req, res) {
    try {
      let fechaCierre = finDeMesAnterior();

      if (req.body?.fecha) {
        fechaCierre = parseFecha(req.body.fecha);
        if (!fechaCierre) {
          return res.status(400).json({
            success: false,
            error: 'Formato de fecha inválido (use YYYYMMDD o YYYY-MM-DD)'
          });
        }
      }

      const resultado = await fondeoEstableService.generarReporte(fechaCierre);

      if (resultado.success) {
        res.json({
          success: true,
          mensaje: 'Reporte Fondeo Estable generado y enviado',
          data: resultado
        });
      } else {
        res.status(400).json({
          success: false,
          mensaje: resultado.mensaje,
          data: resultado
        });
      }
    } catch (error) {
      logger.error(`Error en controller fondeo estable: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new FondeoEstableController();
