const carteraHeredadaService = require('./cartera-heredada.service');

class CarteraHeredadaController {
  /**
   * req.fechaCierre ya viene validada por shared/validators/fecha.validator.js
   */
  async generarAhora(req, res) {
    const resultado = await carteraHeredadaService.generarReporte(req.fechaCierre);

    res.status(resultado.success ? 200 : 400).json({
      success: resultado.success,
      mensaje: resultado.success
        ? 'Reporte Cartera Heredada PDM generado y enviado'
        : resultado.mensaje,
      data: resultado
    });
  }
}

module.exports = new CarteraHeredadaController();
