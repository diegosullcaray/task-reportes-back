const db = require('../../../infrastructure/database/database');
const { enviarEmail } = require('../../../infrastructure/email/mailer');
const { plantillaCorreoReporteHtml } = require('../../../shared/utils/email-template');
const { formatearEntero, formatearMonto, construirTablaHtml } = require('../../../shared/utils/html');
const destinatarios = require('../../../config/destinatarios');
const queries = require('./ratio-ce.query');
const { finDeMesAnterior, aYYYYMMDD } = require('../../../shared/utils/fechas');
const logger = require('../../../infrastructure/logging/logger');

// Orden fijo de las sub-categorías de zona en la tabla dinámica
const ORDEN_ZONA = ['INDETERMINADO', 'RURAL', 'URBANO'];
// Orden fijo de los grupos migratorios (Migrante primero, como en el correo original)
const ORDEN_MIGRACION = ['Migrante', 'Peruano'];

class RatioCEService {
  /**
   * Genera el reporte mensual "Ratio CE, Clientes Nuevos y Migrantes" y lo
   * envía por correo. A diferencia de los otros reportes NO adjunta Excel:
   * el resultado va como tablas HTML en el cuerpo del correo (reproduce la
   * tabla dinámica del correo original).
   *
   * @param {Date} [fechaCierre] - Fecha de cierre; por defecto fin del mes anterior
   */
  async generarReporte(fechaCierre = finDeMesAnterior()) {
    try {
      const fecha = aYYYYMMDD(fechaCierre);

      logger.info(`🔄 [RATIO CE] Generando reporte al cierre ${fecha}...`);

      // 1. Obtener datos (dos consultas: ratio CE y clientes por migración/zona)
      const [datosRatio, datosClientes] = await Promise.all([
        db.ejecutarQuery(queries.obtenerRatioCE(fecha)),
        db.ejecutarQuery(queries.obtenerClientesMigrantes(fecha))
      ]);

      if (datosClientes.length === 0 && datosRatio.length === 0) {
        logger.warn(`⚠️ [RATIO CE] Sin datos para el cierre ${fecha}`);
        return {
          success: false,
          mensaje: `Sin datos de Ratio CE / Clientes para el cierre ${fecha}`
        };
      }

      // 2. Construir el cuerpo del correo: bloques de desembolsos CE (texto,
      //    como en el correo original de Pierro) + tabla dinámica de clientes
      const bloquesCEHtml = this._construirBloqueCE(datosRatio);
      const { html: tablaClientesHtml, totalGeneral } = this._construirTablaClientes(datosClientes, fechaCierre);
      const cuerpoHtml = `${bloquesCEHtml}${tablaClientesHtml}`;

      // 3. Enviar correo (sin adjunto: el resultado va en el cuerpo)
      const { html: contenidoHtml, firmaAttachments } = plantillaCorreoReporteHtml({
        saludo: 'Estimados,',
        mensaje: `se comparten los datos del cierre ${fecha}:`,
        cuerpoHtml
      });

      const correo = await enviarEmail({
        asunto: `Datos Cierre - ${fecha}`,
        contenidoHtml,
        para: destinatarios.ratioCE.para,
        cc: destinatarios.ratioCE.cc,
        archivo: null,
        firmaAttachments
      });

      if (!correo.enviado) {
        logger.warn(`⚠️ [RATIO CE] Datos obtenidos pero el correo NO se envió: ${correo.error}`);
        return {
          success: false,
          mensaje: `Datos obtenidos (${totalGeneral} clientes) pero el correo NO se envió: ${correo.error}`,
          fechaCierre: fecha,
          totalClientes: totalGeneral,
          correo
        };
      }

      logger.info('✅ [RATIO CE] Reporte completado y correo enviado');
      return {
        success: true,
        fechaCierre: fecha,
        totalClientes: totalGeneral,
        correo
      };

    } catch (error) {
      logger.error(`❌ [RATIO CE] Error generando reporte: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bloques de texto de los desembolsos CE, tal cual el correo original:
   *
   *   Desembolsos habilitados posibles desembolsos CE
   *   Operación: 35848
   *   Monto: 129,738,729.43
   *
   *   Desembolsos CE
   *   Operación: 28125
   *   Monto: 90,864,991.82
   */
  _construirBloqueCE(datosRatio) {
    if (!datosRatio || datosRatio.length === 0) return '';

    const porTipo = (tipo) => datosRatio.find(r => r.tipo === tipo) || { operaciones: 0, monto: 0 };
    const habilitados = porTipo('Habilitados');
    const ce = porTipo('CE');

    const bloque = (titulo, dato) => `
      <p style="margin: 14px 0 2px;"><strong>${titulo}</strong></p>
      <p style="margin: 0 0 4px;">Operación: ${formatearEntero(dato.operaciones)}<br>Monto: ${formatearMonto(dato.monto)}</p>`;

    return `
      ${bloque('Desembolsos habilitados posibles desembolsos CE', habilitados)}
      ${bloque('Desembolsos CE', ce)}`;
  }

  /**
   * Tabla dinámica de clientes: agrupa por condición migratoria (Migrante /
   * Peruano) y, dentro de cada grupo, por zona (INDETERMINADO / RURAL /
   * URBANO), con subtotal por grupo y total general. Reproduce el pivot del
   * correo original.
   * @returns {{ html: string, totalGeneral: number }}
   */
  _construirTablaClientes(datosClientes, fechaCierre) {
    if (!datosClientes || datosClientes.length === 0) {
      return { html: '', totalGeneral: 0 };
    }

    // Agrupar: { Migrante: { RURAL: n, URBANO: n, ... }, Peruano: {...} }
    const grupos = {};
    for (const fila of datosClientes) {
      const mig = (fila.HINDMIG || 'Indeterminado').trim();
      const zona = (fila.HINDRUR || 'INDETERMINADO').trim().toUpperCase();
      const nro = Number(fila.NROCLI) || 0;
      grupos[mig] = grupos[mig] || {};
      grupos[mig][zona] = (grupos[mig][zona] || 0) + nro;
    }

    // Ordenar grupos: primero los conocidos (Migrante, Peruano), luego el resto
    const nombresGrupos = Object.keys(grupos).sort((a, b) => {
      const ia = ORDEN_MIGRACION.indexOf(a);
      const ib = ORDEN_MIGRACION.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
    });

    const filas = [];
    let totalGeneral = 0;

    for (const grupo of nombresGrupos) {
      const zonas = grupos[grupo];
      const subtotal = Object.values(zonas).reduce((a, b) => a + b, 0);
      totalGeneral += subtotal;

      // Fila de grupo (negrita, con subtotal)
      filas.push([
        { valor: grupo, negrita: true, fondo: '#f5f9fd' },
        { valor: formatearEntero(subtotal), negrita: true, fondo: '#f5f9fd' }
      ]);

      // Sub-filas por zona: primero las del orden fijo, luego cualquier zona extra
      const zonasOrdenadas = [
        ...ORDEN_ZONA.filter(z => z in zonas),
        ...Object.keys(zonas).filter(z => !ORDEN_ZONA.includes(z)).sort()
      ];
      for (const zona of zonasOrdenadas) {
        filas.push([
          { valor: zona, sangria: true },
          { valor: formatearEntero(zonas[zona]) }
        ]);
      }
    }

    // Total general
    filas.push([
      { valor: 'Total general', negrita: true, fondo: '#dcebf9' },
      { valor: formatearEntero(totalGeneral), negrita: true, fondo: '#dcebf9' }
    ]);

    const html = construirTablaHtml({
      titulo: 'Clientes Nuevos y Migrantes',
      columnas: ['Etiquetas de fila', this._formatearFechaColumna(fechaCierre)],
      filas
    });

    return { html, totalGeneral };
  }

  /** Formatea la fecha de cierre como dd/mm/yyyy para el encabezado de columna. */
  _formatearFechaColumna(fechaCierre) {
    const d = String(fechaCierre.getDate()).padStart(2, '0');
    const m = String(fechaCierre.getMonth() + 1).padStart(2, '0');
    return `${d}/${m}/${fechaCierre.getFullYear()}`;
  }
}

module.exports = new RatioCEService();
