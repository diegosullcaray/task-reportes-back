const db = require('../../config/database');
const { generarExcel } = require('../../utils/excel');
const { enviarEmail } = require('../../config/mailer');
const { plantillaReporte, cajasFechaHora } = require('../../utils/email');
const queries = require('./ventas.query');
const logger = require('../../utils/logger');

class VentasService {
  /**
   * Genera reporte de ventas del día
   * Ejecuta query → genera Excel → envía email
   */
  async generarReporteDiario() {
    try {
      logger.info('🔄 Iniciando reporte de ventas diarias...');

      // 1. Obtener datos
      const datos = await db.ejecutarQuery(queries.obtenerVentasDelDia());

      if (datos.length === 0) {
        logger.warn('⚠️ Sin datos de ventas para hoy');
        return {
          success: false,
          mensaje: 'Sin datos de ventas en el día',
          fecha: new Date()
        };
      }

      // 2. Generar Excel
      const archivo = await generarExcel(datos, 'Reporte_Ventas_Diarias');

      // 3. Preparar email
      const totalVentas = datos.reduce((sum, row) => sum + (row.monto_total || 0), 0);

      const contenidoHtml = plantillaReporte('📊 Reporte de Ventas Diarias', [
        ...cajasFechaHora(),
        { label: '📦 Productos Vendidos', valor: datos.length },
        {
          label: '💰 Monto Total',
          valor: `$${totalVentas.toLocaleString('es-ES', { maximumFractionDigits: 2 })}`
        }
      ]);

      // 4. Enviar email
      await enviarEmail(
        `📊 Reporte Ventas Diarias - ${new Date().toLocaleDateString('es-ES')}`,
        contenidoHtml,
        archivo
      );

      logger.info('✅ Reporte de ventas completado exitosamente');
      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas,
        fecha: new Date()
      };

    } catch (error) {
      logger.error(`❌ Error en reporte de ventas diarias: ${error.message}`);
      throw error;
    }
  }

  /**
   * Genera reporte de ventas por rango de fechas
   */
  async generarReportePorRango(fechaInicio, fechaFin) {
    try {
      logger.info(`🔄 Reporte ventas: ${fechaInicio} a ${fechaFin}`);

      if (!this.validarFecha(fechaInicio) || !this.validarFecha(fechaFin)) {
        throw new Error('Formato de fecha inválido (use YYYY-MM-DD)');
      }

      const datos = await db.ejecutarQuery(
        queries.obtenerVentasPorRango(fechaInicio, fechaFin)
      );

      if (datos.length === 0) {
        return {
          success: false,
          mensaje: 'Sin datos en este rango de fechas'
        };
      }

      const archivo = await generarExcel(
        datos,
        `Reporte_Ventas_${fechaInicio}_a_${fechaFin}`
      );

      const contenidoHtml = plantillaReporte('📊 Reporte de Ventas por Rango', [
        { label: '📅 Desde', valor: fechaInicio },
        { label: '📅 Hasta', valor: fechaFin },
        { label: '📄 Filas', valor: archivo.filas },
        { label: '⏰ Hora Reporte', valor: new Date().toLocaleTimeString('es-ES') }
      ]);

      await enviarEmail(
        `📊 Reporte Ventas ${fechaInicio} a ${fechaFin}`,
        contenidoHtml,
        archivo
      );

      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas
      };

    } catch (error) {
      logger.error(`Error en reporte por rango: ${error.message}`);
      throw error;
    }
  }

  /**
   * Genera top 10 productos de los últimos N días
   */
  async generarTopProductos(dias = 30) {
    try {
      logger.info(`🔄 Generando top 10 productos (últimos ${dias} días)`);

      const datos = await db.ejecutarQuery(queries.obtenerTop10Productos(dias));

      if (datos.length === 0) {
        return {
          success: false,
          mensaje: 'Sin datos'
        };
      }

      const archivo = await generarExcel(datos, 'Reporte_Top_Productos');

      const contenidoHtml = plantillaReporte('🏆 Top 10 Productos', [
        ...cajasFechaHora(),
        { label: '🗓️ Periodo', valor: `Últimos ${dias} días` },
        { label: '📦 Productos', valor: archivo.filas }
      ]);

      await enviarEmail(
        `🏆 Top 10 Productos - ${new Date().toLocaleDateString('es-ES')}`,
        contenidoHtml,
        archivo
      );

      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas
      };

    } catch (error) {
      logger.error(`Error en top productos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Valida formato de fecha YYYY-MM-DD
   */
  validarFecha(fecha) {
    return /^\d{4}-\d{2}-\d{2}$/.test(fecha);
  }
}

module.exports = new VentasService();
