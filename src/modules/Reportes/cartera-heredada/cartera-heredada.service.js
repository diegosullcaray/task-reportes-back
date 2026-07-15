const db = require('../../../config/database');
const { generarExcel } = require('../../../utils/excel');
const { enviarEmail } = require('../../../config/mailer');
const { plantillaCorreoReporte } = require('../../../utils/email');
const destinatarios = require('../../../config/destinatarios');
const queries = require('./cartera-heredada.query');
const { finDeMesAnterior, aYYYYMMDD, nombreMes, anioCorto } = require('../../../utils/fechas');
const logger = require('../../../utils/logger');

class CarteraHeredadaService {
  /**
   * Genera el reporte mensual Cartera Heredada PDM y lo envía por correo.
   * Asunto:  "Cartera Heredada PDM - Stock Junio 2026"
   * Adjunto: "PDM Heredado Junio 26.xlsx"
   *
   * @param {Date} [fechaCierre] - Fecha de cierre; por defecto fin del mes anterior
   */
  async generarReporte(fechaCierre = finDeMesAnterior()) {
    try {
      const fecha = aYYYYMMDD(fechaCierre);
      const mes = nombreMes(fechaCierre);
      const anio = fechaCierre.getFullYear();

      logger.info(`🔄 [CARTERA HEREDADA] Generando reporte al cierre ${fecha}...`);

      // 1. Obtener datos (Servidor 213; requiere cubo y PDM completos)
      const datos = await db.ejecutarQuery(queries.obtenerCarteraHeredada(fecha));

      if (datos.length === 0) {
        logger.warn(`⚠️ [CARTERA HEREDADA] Sin datos para el cierre ${fecha} (¿cubo/PDM completos?)`);
        return {
          success: false,
          mensaje: `Sin datos de cartera heredada para el cierre ${fecha}. Verificar que la data del cubo y PDM estén completadas.`
        };
      }

      // 2. Generar Excel
      const archivo = await generarExcel(datos, `PDM Heredado ${mes} ${anioCorto(fechaCierre)}.xlsx`);

      // 3. Enviar correo
      const { html: contenidoHtml, firmaAttachments } = plantillaCorreoReporte('Estimado Alvaro,');

      const correo = await enviarEmail({
        asunto: `Cartera Heredada PDM - Stock ${mes} ${anio}`,
        contenidoHtml,
        para: destinatarios.carteraHeredada.para,
        cc: destinatarios.carteraHeredada.cc,
        archivo,
        firmaAttachments
      });

      if (!correo.enviado) {
        logger.warn(`⚠️ [CARTERA HEREDADA] Excel generado pero el correo NO se envió: ${correo.error}`);
        return {
          success: false,
          mensaje: `Excel generado (${archivo.nombre}, ${archivo.filas} filas) pero el correo NO se envió: ${correo.error}`,
          archivo: archivo.nombre,
          filas: archivo.filas,
          fechaCierre: fecha,
          correo
        };
      }

      logger.info('✅ [CARTERA HEREDADA] Reporte completado y correo enviado');
      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas,
        fechaCierre: fecha,
        correo
      };

    } catch (error) {
      logger.error(`❌ [CARTERA HEREDADA] Error generando reporte: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new CarteraHeredadaService();
