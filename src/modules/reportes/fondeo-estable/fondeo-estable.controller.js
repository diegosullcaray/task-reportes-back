const fondeoEstableService = require('./fondeo-estable.service');

class FondeoEstableController {
  /**
   * req.fechaCierre ya viene validada por shared/validators/fecha.validator.js
   */
  async generarAhora(req, res) {
    const resultado = await fondeoEstableService.generarReporte(req.fechaCierre);

    res.status(resultado.success ? 200 : 400).json({
      success: resultado.success,
      mensaje: resultado.success
        ? 'Reporte Fondeo Estable generado y enviado'
        : resultado.mensaje,
      data: resultado
    });
  }
}

module.exports = new FondeoEstableController();
