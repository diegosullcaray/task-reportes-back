const db = require('../../config/database');
const { generarExcel } = require('../../utils/excel');
const { enviarEmail } = require('../../config/mailer');
const { plantillaReporte, cajasFechaHora } = require('../../utils/email');
const queries = require('./inventario.query');
const logger = require('../../utils/logger');

class InventarioService {
  /**
   * Genera reporte de productos con stock bajo
   */
  async generarReporteStockBajo() {
    try {
      logger.info('🔄 Iniciando reporte de stock bajo...');

      const datos = await db.ejecutarQuery(queries.obtenerStockBajo());

      if (datos.length === 0) {
        logger.info('✓ Sin productos con stock bajo');
        return {
          success: false,
          mensaje: 'Sin productos con stock bajo'
        };
      }

      const archivo = await generarExcel(datos, 'Reporte_Stock_Bajo');

      const contenidoHtml = plantillaReporte('⚠️ Reporte de Stock Bajo', [
        ...cajasFechaHora(),
        { label: '📦 Productos en alerta', valor: datos.length }
      ]);

      await enviarEmail(
        `⚠️ Alerta Stock Bajo - ${new Date().toLocaleDateString('es-ES')}`,
        contenidoHtml,
        archivo
      );

      logger.info('✅ Reporte de stock bajo completado');
      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas,
        fecha: new Date()
      };

    } catch (error) {
      logger.error(`❌ Error en reporte de stock bajo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Genera reporte de inventario total valorizado
   */
  async generarReporteTotal() {
    try {
      logger.info('🔄 Iniciando reporte de inventario total...');

      const datos = await db.ejecutarQuery(queries.obtenerInventarioTotal());

      if (datos.length === 0) {
        return {
          success: false,
          mensaje: 'Sin datos de inventario'
        };
      }

      const archivo = await generarExcel(datos, 'Reporte_Inventario_Total');

      const valorTotal = datos.reduce((sum, row) => sum + (row.valor_total || 0), 0);

      const contenidoHtml = plantillaReporte('📦 Reporte de Inventario Total', [
        ...cajasFechaHora(),
        { label: '📦 Productos', valor: datos.length },
        {
          label: '💰 Valor Total',
          valor: `$${valorTotal.toLocaleString('es-ES', { maximumFractionDigits: 2 })}`
        }
      ]);

      await enviarEmail(
        `📦 Reporte Inventario Total - ${new Date().toLocaleDateString('es-ES')}`,
        contenidoHtml,
        archivo
      );

      logger.info('✅ Reporte de inventario total completado');
      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas,
        fecha: new Date()
      };

    } catch (error) {
      logger.error(`❌ Error en reporte de inventario total: ${error.message}`);
      throw error;
    }
  }

  /**
   * Genera reporte de movimientos de inventario por rango de fechas
   */
  async generarReporteMovimientos(fechaInicio, fechaFin) {
    try {
      logger.info(`🔄 Reporte movimientos inventario: ${fechaInicio} a ${fechaFin}`);

      if (!this.validarFecha(fechaInicio) || !this.validarFecha(fechaFin)) {
        throw new Error('Formato de fecha inválido (use YYYY-MM-DD)');
      }

      const datos = await db.ejecutarQuery(
        queries.obtenerMovimientos(fechaInicio, fechaFin)
      );

      if (datos.length === 0) {
        return {
          success: false,
          mensaje: 'Sin movimientos en este rango de fechas'
        };
      }

      const archivo = await generarExcel(
        datos,
        `Reporte_Movimientos_${fechaInicio}_a_${fechaFin}`
      );

      const contenidoHtml = plantillaReporte('🔄 Movimientos de Inventario', [
        { label: '📅 Desde', valor: fechaInicio },
        { label: '📅 Hasta', valor: fechaFin },
        { label: '📄 Movimientos', valor: archivo.filas },
        { label: '⏰ Hora Reporte', valor: new Date().toLocaleTimeString('es-ES') }
      ]);

      await enviarEmail(
        `🔄 Movimientos Inventario ${fechaInicio} a ${fechaFin}`,
        contenidoHtml,
        archivo
      );

      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas
      };

    } catch (error) {
      logger.error(`Error en reporte de movimientos: ${error.message}`);
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

module.exports = new InventarioService();
