const reporteGiancarloService = require('./reporte-giancarlo.service');

class ReporteGiancarloController {
  /**
   * req.fechaCierre ya viene validada por shared/validators/fecha.validator.js
   */
  async generarAhora(req, res) {
    const resultado = await reporteGiancarloService.generarReporte(req.fechaCierre);

    res.status(resultado.success ? 200 : 400).json({
      success: resultado.success,
      mensaje: resultado.success
        ? 'Reporte Saca tu Garra generado y enviado'
        : resultado.mensaje,
      data: resultado
    });
  }
}

module.exports = new ReporteGiancarloController();
