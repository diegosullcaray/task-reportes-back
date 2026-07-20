const saldoMedioVigenteService = require('./saldo-medio-vigente.service');

class SaldoMedioVigenteController {
  /**
   * req.fechaCierre ya viene validada por shared/validators/fecha.validator.js
   */
  async generarAhora(req, res) {
    const resultado = await saldoMedioVigenteService.generarReporte(req.fechaCierre);

    res.status(resultado.success ? 200 : 400).json({
      success: resultado.success,
      mensaje: resultado.success
        ? 'Reporte Saldo Medio Vigente generado y enviado'
        : resultado.mensaje,
      data: resultado
    });
  }
}

module.exports = new SaldoMedioVigenteController();
