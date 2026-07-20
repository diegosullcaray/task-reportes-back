const db = require('../../../infrastructure/database/database');
const { generarExcelMultiHoja } = require('../../../shared/utils/excel');
const { enviarEmail } = require('../../../infrastructure/email/mailer');
const { plantillaCorreoReporte } = require('../../../shared/utils/email-template');
const destinatarios = require('../../../config/destinatarios');
const queries = require('./saldo-puntual-medio.query');
const { finDeMesAnterior, aYYYYMMDD } = require('../../../shared/utils/fechas');
const logger = require('../../../infrastructure/logging/logger');

class SaldoPuntualMedioService {
  /**
   * Genera el reporte mensual "Saldo Puntual - Saldo Medio" y lo envía por
   * correo. El Excel tiene dos hojas: "Saldo Puntual" y "Saldo Medio".
   * Asunto:  "Saldo Puntual - Saldo Medio - 20260630"
   * Adjunto: "Saldo_puntual-Saldo_Medio_20260630.xlsx"
   *
   * @param {Date} [fechaCierre] - Fecha de cierre; por defecto fin del mes anterior
   */
  async generarReporte(fechaCierre = finDeMesAnterior()) {
    try {
      const fecha = aYYYYMMDD(fechaCierre);

      logger.info(`🔄 [SALDO PUNTUAL - SALDO MEDIO] Generando reporte al cierre ${fecha}...`);

      // 1. Obtener datos (dos consultas independientes, una por hoja)
      const [saldoPuntual, saldoMedio] = await Promise.all([
        db.ejecutarQuery(queries.obtenerSaldoPuntual(fecha)),
        db.ejecutarQuery(queries.obtenerSaldoMedio(fecha))
      ]);

      if (saldoPuntual.length === 0 && saldoMedio.length === 0) {
        logger.warn(`⚠️ [SALDO PUNTUAL - SALDO MEDIO] Sin datos para el cierre ${fecha}`);
        return {
          success: false,
          mensaje: `Sin datos de saldo puntual/medio para el cierre ${fecha}`
        };
      }

      // 2. Generar Excel con una hoja por dataset
      const archivo = await generarExcelMultiHoja(
        [
          { nombre: 'Saldo Puntual', datos: saldoPuntual },
          { nombre: 'Saldo Medio', datos: saldoMedio }
        ],
        `Saldo_puntual-Saldo_Medio_${fecha}.xlsx`
      );

      // 3. Enviar correo
      const { html: contenidoHtml, firmaAttachments } = plantillaCorreoReporte('Estimados,');

      const correo = await enviarEmail({
        asunto: `Saldo Puntual - Saldo Medio - ${fecha}`,
        contenidoHtml,
        para: destinatarios.saldoPuntualMedio.para,
        cc: destinatarios.saldoPuntualMedio.cc,
        archivo,
        firmaAttachments
      });

      if (!correo.enviado) {
        logger.warn(`⚠️ [SALDO PUNTUAL - SALDO MEDIO] Excel generado pero el correo NO se envió: ${correo.error}`);
        return {
          success: false,
          mensaje: `Excel generado (${archivo.nombre}, ${archivo.filas} filas) pero el correo NO se envió: ${correo.error}`,
          archivo: archivo.nombre,
          filas: archivo.filas,
          fechaCierre: fecha,
          correo
        };
      }

      logger.info('✅ [SALDO PUNTUAL - SALDO MEDIO] Reporte completado y correo enviado');
      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas,
        fechaCierre: fecha,
        correo
      };

    } catch (error) {
      logger.error(`❌ [SALDO PUNTUAL - SALDO MEDIO] Error generando reporte: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new SaldoPuntualMedioService();
