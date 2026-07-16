const controlCargasService = require('./control-cargas.service');
const logger = require('../../../utils/logger');

class ControlCargasController {
  /**
   * GET /api/validaciones/control-cargas
   * Obtiene la validación en vivo del estado de las cargas y carteras críticas
   */
  async obtenerEstado(req, res) {
    try {
      const resultado = await controlCargasService.validarCargas();

      if (resultado.success) {
        res.json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      logger.error(`Error en controller control de cargas: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ControlCargasController();