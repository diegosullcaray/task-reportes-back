const db = require('../../../infrastructure/database/database');
const { generarExcelMultiHoja } = require('../../../shared/utils/excel');
const { enviarEmail } = require('../../../infrastructure/email/mailer');
const { plantillaCorreoReporte } = require('../../../shared/utils/email-template');
const destinatarios = require('../../../config/destinatarios');
const queries = require('./saldo-vigente-agro.query');
const { finDeMesAnterior, aYYYYMMDD } = require('../../../shared/utils/fechas');
const logger = require('../../../infrastructure/logging/logger');

/** Formatea una fecha como YYYY-MM-DD (formato usado por este query fuente). */
function aYYYYMMDDGuiones(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

class SaldoVigenteAgroService {
  /**
   * Genera el reporte mensual "Saldo Vigente - Producto Agro" y lo envía por
   * correo. El Excel tiene tres hojas: saldo vigente actual, saldo vigente
   * del mes anterior y el comparativo de cierre de operaciones.
   * Asunto:  "Saldo Vigente Agro - 20260630"
   * Adjunto: "Cartera_VigenteAgro_20260630.xlsx"
   *
   * @param {Date} [fechaCierre] - Fecha de cierre; por defecto fin del mes anterior
   */
  async generarReporte(fechaCierre = finDeMesAnterior()) {
    try {
      const fecha = aYYYYMMDD(fechaCierre);
      const fechaGuiones = aYYYYMMDDGuiones(fechaCierre);
      const fechaAnteriorGuiones = aYYYYMMDDGuiones(finDeMesAnterior(fechaCierre));

      logger.info(`🔄 [SALDO VIGENTE AGRO] Generando reporte al cierre ${fecha}...`);

      // 1. Obtener datos (tres consultas independientes, una por hoja)
      const [saldoActual, saldoAnterior, comparativoCierre] = await Promise.all([
        db.ejecutarQuery(queries.obtenerSaldoVigenteActual(fechaGuiones, fechaAnteriorGuiones)),
        db.ejecutarQuery(queries.obtenerSaldoVigenteAnterior(fechaGuiones, fechaAnteriorGuiones)),
        db.ejecutarQuery(queries.obtenerComparativoCierre(fechaGuiones, fechaAnteriorGuiones))
      ]);

      if (saldoActual.length === 0 && saldoAnterior.length === 0 && comparativoCierre.length === 0) {
        logger.warn(`⚠️ [SALDO VIGENTE AGRO] Sin datos para el cierre ${fecha}`);
        return {
          success: false,
          mensaje: `Sin datos de saldo vigente agro para el cierre ${fecha}`
        };
      }

      // 2. Generar Excel con una hoja por dataset
      const archivo = await generarExcelMultiHoja(
        [
          { nombre: 'Saldo Vigente Actual', datos: saldoActual },
          { nombre: 'Saldo Vigente Anterior', datos: saldoAnterior },
          { nombre: 'Comparativo Cierre', datos: comparativoCierre }
        ],
        `Cartera_VigenteAgro_${fecha}.xlsx`
      );

      // 3. Enviar correo
      const { html: contenidoHtml, firmaAttachments } = plantillaCorreoReporte('Estimados,');

      const correo = await enviarEmail({
        asunto: `Saldo Vigente Agro - ${fecha}`,
        contenidoHtml,
        para: destinatarios.saldoVigenteAgro.para,
        cc: destinatarios.saldoVigenteAgro.cc,
        archivo,
        firmaAttachments
      });

      if (!correo.enviado) {
        logger.warn(`⚠️ [SALDO VIGENTE AGRO] Excel generado pero el correo NO se envió: ${correo.error}`);
        return {
          success: false,
          mensaje: `Excel generado (${archivo.nombre}, ${archivo.filas} filas) pero el correo NO se envió: ${correo.error}`,
          archivo: archivo.nombre,
          filas: archivo.filas,
          fechaCierre: fecha,
          correo
        };
      }

      logger.info('✅ [SALDO VIGENTE AGRO] Reporte completado y correo enviado');
      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas,
        fechaCierre: fecha,
        correo
      };

    } catch (error) {
      logger.error(`❌ [SALDO VIGENTE AGRO] Error generando reporte: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new SaldoVigenteAgroService();
