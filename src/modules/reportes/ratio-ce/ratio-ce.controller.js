const ratioCEService = require('./ratio-ce.service');

class RatioCEController {
  /**
   * req.fechaCierre ya viene validada por shared/validators/fecha.validator.js
   */
  async generarAhora(req, res) {
    const resultado = await ratioCEService.generarReporte(req.fechaCierre);

    res.status(resultado.success ? 200 : 400).json({
      success: resultado.success,
      mensaje: resultado.success
        ? 'Reporte Ratio CE, Clientes Nuevos y Migrantes generado y enviado'
        : resultado.mensaje,
      data: resultado
    });
  }
}

module.exports = new RatioCEController();
