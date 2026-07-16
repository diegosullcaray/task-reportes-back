const db = require('../../../infrastructure/database/database');
const { generarExcel } = require('../../../shared/utils/excel');
const { enviarEmail } = require('../../../infrastructure/email/mailer');
const { plantillaCorreoReporte } = require('../../../shared/utils/email-template');
const destinatarios = require('../../../config/destinatarios');
const queries = require('./fondeo-estable.query');
const { finDeMesAnterior, aYYYYMMDD } = require('../../../shared/utils/fechas');
const logger = require('../../../infrastructure/logging/logger');

class FondeoEstableService {
  /**
   * Genera el reporte mensual Fondeo Estable y lo envía por correo.
   * Asunto:  "Fondeo Estable - 20260630"
   * Adjunto: "Saldo_FondeoEstable_20260630.xlsx"
   * Se envía a Eddy Martinez, con copia a Michael y Abigail.
   *
   * @param {Date} [fechaCierre] - Fecha de cierre; por defecto fin del mes anterior
   */
  async generarReporte(fechaCierre = finDeMesAnterior()) {
    try {
      const fecha = aYYYYMMDD(fechaCierre);

      logger.info(`🔄 [FONDEO ESTABLE] Generando reporte al cierre ${fecha}...`);

      // 1. Obtener datos
      const datos = await db.ejecutarQuery(queries.obtenerFondeoEstable(fecha));

      if (datos.length === 0) {
        logger.warn(`⚠️ [FONDEO ESTABLE] Sin datos para el cierre ${fecha}`);
        return {
          success: false,
          mensaje: `Sin datos de fondeo estable para el cierre ${fecha}`
        };
      }

      // 2. Generar Excel
      const archivo = await generarExcel(datos, `Saldo_FondeoEstable_${fecha}.xlsx`);

      // 3. Enviar correo
      const { html: contenidoHtml, firmaAttachments } = plantillaCorreoReporte('Estimado Eddy,');

      const correo = await enviarEmail({
        asunto: `Fondeo Estable - ${fecha}`,
        contenidoHtml,
        para: destinatarios.fondeoEstable.para,
        cc: destinatarios.fondeoEstable.cc,
        archivo,
        firmaAttachments
      });

      if (!correo.enviado) {
        logger.warn(`⚠️ [FONDEO ESTABLE] Excel generado pero el correo NO se envió: ${correo.error}`);
        return {
          success: false,
          mensaje: `Excel generado (${archivo.nombre}, ${archivo.filas} filas) pero el correo NO se envió: ${correo.error}`,
          archivo: archivo.nombre,
          filas: archivo.filas,
          fechaCierre: fecha,
          correo
        };
      }

      logger.info('✅ [FONDEO ESTABLE] Reporte completado y correo enviado');
      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas,
        fechaCierre: fecha,
        correo
      };

    } catch (error) {
      logger.error(`❌ [FONDEO ESTABLE] Error generando reporte: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new FondeoEstableService();
