const inventarioService = require('./inventario.service');
const logger = require('../../utils/logger');

class InventarioController {
  /**
   * POST /api/reportes/inventario/stock-bajo
   */
  async generarStockBajo(req, res) {
    try {
      const resultado = await inventarioService.generarReporteStockBajo();

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
      logger.error(`Error en controller stock bajo: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/reportes/inventario/total
   */
  async generarTotal(req, res) {
    try {
      const resultado = await inventarioService.generarReporteTotal();

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
      logger.error(`Error en controller inventario total: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/reportes/inventario/movimientos
   * Body: { "fechaInicio": "2024-01-01", "fechaFin": "2024-01-31" }
   */
  async generarMovimientos(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.body;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          error: 'Faltan parámetros: fechaInicio, fechaFin'
        });
      }

      const resultado = await inventarioService.generarReporteMovimientos(
        fechaInicio,
        fechaFin
      );

      if (resultado.success) {
        res.json({
          success: true,
          mensaje: 'Reporte generado',
          data: resultado
        });
      } else {
        res.status(400).json({
          success: false,
          mensaje: resultado.mensaje
        });
      }
    } catch (error) {
      logger.error(`Error en controller movimientos: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new InventarioController();
