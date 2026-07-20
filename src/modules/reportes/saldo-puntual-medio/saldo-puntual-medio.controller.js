const saldoPuntualMedioService = require('./saldo-puntual-medio.service');

class SaldoPuntualMedioController {
  /**
   * req.fechaCierre ya viene validada por shared/validators/fecha.validator.js
   */
  async generarAhora(req, res) {
    const resultado = await saldoPuntualMedioService.generarReporte(req.fechaCierre);

    res.status(resultado.success ? 200 : 400).json({
      success: resultado.success,
      mensaje: resultado.success
        ? 'Reporte Saldo Puntual - Saldo Medio generado y enviado'
        : resultado.mensaje,
      data: resultado
    });
  }
}

module.exports = new SaldoPuntualMedioController();
