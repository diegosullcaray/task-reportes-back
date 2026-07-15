const db = require('../../config/database');
const { generarExcel } = require('../../utils/excel');
const { enviarEmail } = require('../../config/mailer');
const { plantillaCorreoReporte } = require('../../utils/email');
const destinatarios = require('../../config/destinatarios');
const queries = require('./desembolso-canal.query');
const { finDeMesAnterior, aYYYYMMDD } = require('../../utils/fechas');
const logger = require('../../utils/logger');

class DesembolsoCanalService {
  /**
   * Genera el reporte mensual Desembolso Canal y lo envía por correo.
   * Asunto:  "Desembolso Canal - 20260630"
   * Adjunto: "Desembolsos_canal_20260630.xlsx"
   *
   * @param {Date} [fechaCierre] - Fecha de cierre; por defecto fin del mes anterior
   */
  async generarReporte(fechaCierre = finDeMesAnterior()) {
    try {
      const fecha = aYYYYMMDD(fechaCierre);

      logger.info(`🔄 [DESEMBOLSO CANAL] Generando reporte al cierre ${fecha}...`);

      // 1. Obtener datos
      const datos = await db.ejecutarQuery(queries.obtenerDesembolsosCanal(fecha));

      if (datos.length === 0) {
        logger.warn(`⚠️ [DESEMBOLSO CANAL] Sin datos para el cierre ${fecha}`);
        return {
          success: false,
          mensaje: `Sin datos de desembolsos para el cierre ${fecha}`
        };
      }

      // 2. Generar Excel
      const archivo = await generarExcel(datos, `Desembolsos_canal_${fecha}.xlsx`);

      // 3. Enviar correo
      const contenidoHtml = plantillaCorreoReporte('Estimados,');

      const enviado = await enviarEmail({
        asunto: `Desembolso Canal - ${fecha}`,
        contenidoHtml,
        para: destinatarios.desembolsoCanal.para,
        cc: destinatarios.desembolsoCanal.cc,
        archivo
      });

      logger.info('✅ [DESEMBOLSO CANAL] Reporte completado');
      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas,
        fechaCierre: fecha,
        emailEnviado: enviado
      };

    } catch (error) {
      logger.error(`❌ [DESEMBOLSO CANAL] Error generando reporte: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new DesembolsoCanalService();
