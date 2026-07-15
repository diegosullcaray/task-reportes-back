const ventasService = require('./ventas.service');
const logger = require('../../utils/logger');

class VentasController {
  /**
   * POST /api/reportes/ventas/generar-ahora
   * Ejecuta manualmente el reporte de ventas del día
   */
  async generarAhora(req, res) {
    try {
      const resultado = await ventasService.generarReporteDiario();

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
      logger.error(`Error en controller ventas: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/reportes/ventas/por-rango
   * Body: { "fechaInicio": "2024-01-01", "fechaFin": "2024-01-31" }
   */
  async generarPorRango(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.body;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          error: 'Faltan parámetros: fechaInicio, fechaFin'
        });
      }

      const resultado = await ventasService.generarReportePorRango(
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
      logger.error(`Error en rango: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * GET /api/reportes/ventas/top-productos?dias=30
   */
  async obtenerTopProductos(req, res) {
    try {
      const dias = parseInt(req.query.dias, 10) || 30;
      const resultado = await ventasService.generarTopProductos(dias);

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
      logger.error(`Error en top productos: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new VentasController();
