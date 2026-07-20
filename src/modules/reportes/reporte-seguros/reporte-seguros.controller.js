const reporteSegurosService = require('./reporte-seguros.service');

class ReporteSegurosController {
  /**
   * req.fechaCierre ya viene validada por shared/validators/fecha.validator.js
   */
  async generarAhora(req, res) {
    const resultado = await reporteSegurosService.generarReporte(req.fechaCierre);

    res.status(resultado.success ? 200 : 400).json({
      success: resultado.success,
      mensaje: resultado.success
        ? 'Reporte Utilizas Seguros generado y enviado'
        : resultado.mensaje,
      data: resultado
    });
  }
}

module.exports = new ReporteSegurosController();
