const db = require('../../../infrastructure/database/database');
const { generarExcel } = require('../../../shared/utils/excel');
const { enviarEmail } = require('../../../infrastructure/email/mailer');
const { plantillaCorreoReporte } = require('../../../shared/utils/email-template');
const destinatarios = require('../../../config/destinatarios');
const queries = require('./reporte-giancarlo.query');
const { finDeMesAnterior, aYYYYMMDD } = require('../../../shared/utils/fechas');
const logger = require('../../../infrastructure/logging/logger');

class ReporteGiancarloService {
  /**
   * Genera el reporte mensual "Saca tu Garra" y lo envía por correo.
   * Asunto:  "Saca tu Garra - 20260630"
   * Adjunto: "Base Saca tu Garra_20260630.xlsx"
   *
   * @param {Date} [fechaCierre] - Fecha de cierre; por defecto fin del mes anterior
   */
  async generarReporte(fechaCierre = finDeMesAnterior()) {
    try {
      const fecha = aYYYYMMDD(fechaCierre);

      logger.info(`🔄 [SACA TU GARRA] Generando reporte al cierre ${fecha}...`);

      // 1. Obtener datos
      const datos = await db.ejecutarQuery(queries.obtenerSacaTuGarra(fecha));

      if (datos.length === 0) {
        logger.warn(`⚠️ [SACA TU GARRA] Sin datos para el cierre ${fecha}`);
        return {
          success: false,
          mensaje: `Sin datos de Saca tu Garra para el cierre ${fecha}`
        };
      }

      // 2. Generar Excel
      const archivo = await generarExcel(datos, `Base Saca tu Garra_${fecha}.xlsx`);

      // 3. Enviar correo
      const { html: contenidoHtml, firmaAttachments } = plantillaCorreoReporte('Giancarlo,');

      const correo = await enviarEmail({
        asunto: `Saca tu Garra - ${fecha}`,
        contenidoHtml,
        para: destinatarios.reporteGiancarlo.para,
        cc: destinatarios.reporteGiancarlo.cc,
        archivo,
        firmaAttachments
      });

      if (!correo.enviado) {
        logger.warn(`⚠️ [SACA TU GARRA] Excel generado pero el correo NO se envió: ${correo.error}`);
        return {
          success: false,
          mensaje: `Excel generado (${archivo.nombre}, ${archivo.filas} filas) pero el correo NO se envió: ${correo.error}`,
          archivo: archivo.nombre,
          filas: archivo.filas,
          fechaCierre: fecha,
          correo
        };
      }

      logger.info('✅ [SACA TU GARRA] Reporte completado y correo enviado');
      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas,
        fechaCierre: fecha,
        correo
      };

    } catch (error) {
      logger.error(`❌ [SACA TU GARRA] Error generando reporte: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ReporteGiancarloService();
