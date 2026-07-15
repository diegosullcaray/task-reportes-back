const clientesService = require('./clientes.service');
const logger = require('../../utils/logger');

class ClientesController {
  /**
   * POST /api/reportes/clientes/nuevos
   * Body opcional: { "dias": 7 }
   */
  async generarNuevos(req, res) {
    try {
      const dias = parseInt(req.body?.dias, 10) || 7;
      const resultado = await clientesService.generarReporteNuevos(dias);

      if (resultado.success) {
        res.json({
          success: true,
          mensaje: 'Reporte generado exitosamente',
          data: resultado
        });
      } else {
        res.status(400).json({
          success: false,
          mensaje: resultado.mensaje
        });
      }
    } catch (error) {
      logger.error(`Error en controller clientes nuevos: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/reportes/clientes/inactivos?dias=30
   */
  async generarInactivos(req, res) {
    try {
      const dias = parseInt(req.query.dias, 10) || 30;
      const resultado = await clientesService.generarReporteInactivos(dias);

      if (resultado.success) {
        res.json({
          success: true,
          data: resultado
        });
      } else {
        res.status(400).json({
          success: false,
          mensaje: resultado.mensaje
        });
      }
    } catch (error) {
      logger.error(`Error en controller clientes inactivos: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/reportes/clientes/resumen
   */
  async generarResumen(req, res) {
    try {
      const resultado = await clientesService.generarResumen();

      if (resultado.success) {
        res.json({
          success: true,
          mensaje: 'Resumen generado exitosamente',
          data: resultado
        });
      } else {
        res.status(400).json({
          success: false,
          mensaje: resultado.mensaje
        });
      }
    } catch (error) {
      logger.error(`Error en controller resumen clientes: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ClientesController();
