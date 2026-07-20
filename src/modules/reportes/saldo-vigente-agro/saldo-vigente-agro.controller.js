const saldoVigenteAgroService = require('./saldo-vigente-agro.service');

class SaldoVigenteAgroController {
  /**
   * req.fechaCierre ya viene validada por shared/validators/fecha.validator.js
   */
  async generarAhora(req, res) {
    const resultado = await saldoVigenteAgroService.generarReporte(req.fechaCierre);

    res.status(resultado.success ? 200 : 400).json({
      success: resultado.success,
      mensaje: resultado.success
        ? 'Reporte Saldo Vigente Agro generado y enviado'
        : resultado.mensaje,
      data: resultado
    });
  }
}

module.exports = new SaldoVigenteAgroController();
