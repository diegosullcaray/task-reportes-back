const db = require('../../../infrastructure/database/database');
const { enviarEmail } = require('../../../infrastructure/email/mailer');
const { plantillaCorreoReporteHtml } = require('../../../shared/utils/email-template');
const { formatearMonto, construirTablaHtml } = require('../../../shared/utils/html');
const destinatarios = require('../../../config/destinatarios');
const queries = require('./saldo-medio-vigente.query');
const { finDeMesAnterior, aYYYYMMDD, nombreMes } = require('../../../shared/utils/fechas');
const logger = require('../../../infrastructure/logging/logger');

class SaldoMedioVigenteService {
  /**
   * Genera el reporte mensual "Saldo Medio Vigente" y lo envía por correo.
   * A diferencia de los reportes con Excel, el resultado va como texto y una
   * tabla HTML en el cuerpo del correo (tal cual el correo original a Diana).
   * Asunto: "Saldo Medio Vigente - Junio 2026"
   *
   * @param {Date} [fechaCierre] - Fecha de cierre; por defecto fin del mes anterior
   */
  async generarReporte(fechaCierre = finDeMesAnterior()) {
    try {
      const fecha = aYYYYMMDD(fechaCierre);
      const primerDia = aYYYYMMDD(new Date(fechaCierre.getFullYear(), fechaCierre.getMonth(), 1));

      logger.info(`🔄 [SALDO MEDIO VIGENTE] Generando reporte al cierre ${fecha}...`);

      // 1. Obtener datos (total mensual + detalle diario)
      const [datosTotal, datosDiario] = await Promise.all([
        db.ejecutarQuery(queries.obtenerSaldoMedioVigente(fecha)),
        db.ejecutarQuery(queries.obtenerSaldoVigenteDiario(fecha, primerDia))
      ]);

      if (datosTotal.length === 0) {
        logger.warn(`⚠️ [SALDO MEDIO VIGENTE] Sin datos para el cierre ${fecha}`);
        return {
          success: false,
          mensaje: `Sin datos de saldo medio vigente para el cierre ${fecha}`
        };
      }

      // 2. Construir el cuerpo del correo: valor total + tabla diaria
      const saldoTotal = Number(datosTotal[0].HSALMEDMNVIGE) || 0;
      const cuerpoHtml = this._construirCuerpo(saldoTotal, datosDiario);
      const mesAnio = `${nombreMes(fechaCierre)} ${fechaCierre.getFullYear()}`;

      // 3. Enviar correo (sin adjunto: el resultado va en el cuerpo)
      const { html: contenidoHtml, firmaAttachments } = plantillaCorreoReporteHtml({
        saludo: 'Estimada Diana,',
        mensaje: 'se le adjunta lo solicitado:',
        cuerpoHtml
      });

      const correo = await enviarEmail({
        asunto: `Saldo Medio Vigente - ${mesAnio}`,
        contenidoHtml,
        para: destinatarios.saldoMedioVigente.para,
        cc: destinatarios.saldoMedioVigente.cc,
        archivo: null,
        firmaAttachments
      });

      if (!correo.enviado) {
        logger.warn(`⚠️ [SALDO MEDIO VIGENTE] Dato obtenido pero el correo NO se envió: ${correo.error}`);
        return {
          success: false,
          mensaje: `Dato obtenido (${saldoTotal}) pero el correo NO se envió: ${correo.error}`,
          fechaCierre: fecha,
          saldoMedioVigente: saldoTotal,
          correo
        };
      }

      logger.info('✅ [SALDO MEDIO VIGENTE] Reporte completado y correo enviado');
      return {
        success: true,
        fechaCierre: fecha,
        saldoMedioVigente: saldoTotal,
        correo
      };

    } catch (error) {
      logger.error(`❌ [SALDO MEDIO VIGENTE] Error generando reporte: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cuerpo del correo: el valor total (tal cual el correo original, como
   * texto plano) seguido de la tabla de detalle diario del mes.
   */
  _construirCuerpo(saldoTotal, datosDiario) {
    const bloqueTotal = `<p style="margin: 14px 0;">${formatearMonto(saldoTotal)}</p>`;

    if (!datosDiario || datosDiario.length === 0) {
      return bloqueTotal;
    }

    const filas = datosDiario.map(fila => [
      { valor: this._formatearFecha(fila.sfecpro) },
      { valor: formatearMonto(fila.ssalvigmn) }
    ]);

    const tablaHtml = construirTablaHtml({
      titulo: 'Saldo vigente diario del mes',
      columnas: ['Fecha', 'Saldo Vigente'],
      filas
    });

    return `${bloqueTotal}${tablaHtml}`;
  }

  _formatearFecha(fecha) {
    const d = new Date(fecha);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  }
}

module.exports = new SaldoMedioVigenteService();
