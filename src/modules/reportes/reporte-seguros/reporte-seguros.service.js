const db = require('../../../infrastructure/database/database');
const { generarExcel } = require('../../../shared/utils/excel');
const { enviarEmail } = require('../../../infrastructure/email/mailer');
const { plantillaCorreoReporte } = require('../../../shared/utils/email-template');
const destinatarios = require('../../../config/destinatarios');
const queries = require('./reporte-seguros.query');
const { finDeMesAnterior, aYYYYMMDD } = require('../../../shared/utils/fechas');
const logger = require('../../../infrastructure/logging/logger');

// Columnas de jerarquía comercial que, si llegan en NULL, deben mostrarse
// como "SIN ASIGNAR" (ver .docs/MENSUALES/Reporte saldo y seguros - GIovani/Reporte seguros/notas.txt)
const COLUMNAS_JERARQUIA = ['RDESGRU', 'RDESCOR', 'RDESTER', 'SCODDESCRIP'];

class ReporteSegurosService {
  /**
   * Genera el reporte mensual "Utilizas Seguros" y lo envía por correo.
   * Asunto:  "Utilizas Seguros - 20260630"
   * Adjunto: "Reporte Seguros 20260630.xlsx"
   *
   * @param {Date} [fechaCierre] - Fecha de cierre; por defecto fin del mes anterior
   */
  async generarReporte(fechaCierre = finDeMesAnterior()) {
    try {
      const fecha = aYYYYMMDD(fechaCierre);

      logger.info(`🔄 [UTILIZAS SEGUROS] Generando reporte al cierre ${fecha}...`);

      // 1. Obtener datos
      const datos = await db.ejecutarQuery(queries.obtenerUtilizasSeguros(fecha));

      if (datos.length === 0) {
        logger.warn(`⚠️ [UTILIZAS SEGUROS] Sin datos para el cierre ${fecha}`);
        return {
          success: false,
          mensaje: `Sin datos de Utilizas Seguros para el cierre ${fecha}`
        };
      }

      // 2. Reemplazar NULL por "SIN ASIGNAR" en las columnas de jerarquía comercial
      const datosNormalizados = this._normalizarJerarquia(datos);

      // 3. Generar Excel
      const archivo = await generarExcel(datosNormalizados, `Reporte Seguros ${fecha}.xlsx`);

      // 4. Enviar correo
      const { html: contenidoHtml, firmaAttachments } = plantillaCorreoReporte('Estimados,');

      const correo = await enviarEmail({
        asunto: `Utilizas Seguros - ${fecha}`,
        contenidoHtml,
        para: destinatarios.reporteSeguros.para,
        cc: destinatarios.reporteSeguros.cc,
        archivo,
        firmaAttachments
      });

      if (!correo.enviado) {
        logger.warn(`⚠️ [UTILIZAS SEGUROS] Excel generado pero el correo NO se envió: ${correo.error}`);
        return {
          success: false,
          mensaje: `Excel generado (${archivo.nombre}, ${archivo.filas} filas) pero el correo NO se envió: ${correo.error}`,
          archivo: archivo.nombre,
          filas: archivo.filas,
          fechaCierre: fecha,
          correo
        };
      }

      logger.info('✅ [UTILIZAS SEGUROS] Reporte completado y correo enviado');
      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas,
        fechaCierre: fecha,
        correo
      };

    } catch (error) {
      logger.error(`❌ [UTILIZAS SEGUROS] Error generando reporte: ${error.message}`);
      throw error;
    }
  }

  /** Reemplaza NULL por "SIN ASIGNAR" en las columnas de jerarquía comercial. */
  _normalizarJerarquia(datos) {
    return datos.map(fila => {
      const normalizada = { ...fila };
      COLUMNAS_JERARQUIA.forEach(columna => {
        if (columna in normalizada && (normalizada[columna] === null || normalizada[columna] === undefined)) {
          normalizada[columna] = 'SIN ASIGNAR';
        }
      });
      return normalizada;
    });
  }
}

module.exports = new ReporteSegurosService();
