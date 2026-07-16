const desembolsoCanalService = require('./desembolso-canal.service');

class DesembolsoCanalController {
  /**
   * req.fechaCierre ya viene validada por shared/validators/fecha.validator.js
   */
  async generarAhora(req, res) {
    const resultado = await desembolsoCanalService.generarReporte(req.fechaCierre);

    res.status(resultado.success ? 200 : 400).json({
      success: resultado.success,
      mensaje: resultado.success
        ? 'Reporte Desembolso Canal generado y enviado'
        : resultado.mensaje,
      data: resultado
    });
  }
}

module.exports = new DesembolsoCanalController();
