const db = require('../../config/database');
const { generarExcel } = require('../../utils/excel');
const { enviarEmail } = require('../../config/mailer');
const { plantillaReporte, cajasFechaHora } = require('../../utils/email');
const queries = require('./clientes.query');
const logger = require('../../utils/logger');

class ClientesService {
  /**
   * Genera reporte de clientes nuevos de los últimos N días
   */
  async generarReporteNuevos(dias = 7) {
    try {
      logger.info(`🔄 Iniciando reporte de clientes nuevos (últimos ${dias} días)...`);

      const datos = await db.ejecutarQuery(queries.obtenerClientesNuevos(dias));

      if (datos.length === 0) {
        logger.warn('⚠️ Sin clientes nuevos en el periodo');
        return {
          success: false,
          mensaje: `Sin clientes nuevos en los últimos ${dias} días`
        };
      }

      const archivo = await generarExcel(datos, 'Reporte_Clientes_Nuevos');

      const contenidoHtml = plantillaReporte('👥 Reporte de Clientes Nuevos', [
        ...cajasFechaHora(),
        { label: '🗓️ Periodo', valor: `Últimos ${dias} días` },
        { label: '🆕 Clientes Nuevos', valor: datos.length }
      ]);

      await enviarEmail(
        `👥 Reporte Clientes Nuevos - ${new Date().toLocaleDateString('es-ES')}`,
        contenidoHtml,
        archivo
      );

      logger.info('✅ Reporte de clientes nuevos completado');
      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas,
        fecha: new Date()
      };

    } catch (error) {
      logger.error(`❌ Error en reporte de clientes nuevos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Genera reporte de clientes inactivos (sin compras en N días)
   */
  async generarReporteInactivos(dias = 30) {
    try {
      logger.info(`🔄 Iniciando reporte de clientes inactivos (> ${dias} días sin comprar)...`);

      const datos = await db.ejecutarQuery(queries.obtenerClientesInactivos(dias));

      if (datos.length === 0) {
        return {
          success: false,
          mensaje: `Sin clientes inactivos por más de ${dias} días`
        };
      }

      const archivo = await generarExcel(datos, 'Reporte_Clientes_Inactivos');

      const contenidoHtml = plantillaReporte('😴 Reporte de Clientes Inactivos', [
        ...cajasFechaHora(),
        { label: '🗓️ Sin comprar hace', valor: `Más de ${dias} días` },
        { label: '👥 Clientes', valor: datos.length }
      ]);

      await enviarEmail(
        `😴 Reporte Clientes Inactivos - ${new Date().toLocaleDateString('es-ES')}`,
        contenidoHtml,
        archivo
      );

      logger.info('✅ Reporte de clientes inactivos completado');
      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas,
        fecha: new Date()
      };

    } catch (error) {
      logger.error(`❌ Error en reporte de clientes inactivos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Genera resumen de clientes por ciudad
   */
  async generarResumen() {
    try {
      logger.info('🔄 Iniciando resumen de clientes por ciudad...');

      const datos = await db.ejecutarQuery(queries.obtenerResumenPorCiudad());

      if (datos.length === 0) {
        return {
          success: false,
          mensaje: 'Sin datos de clientes'
        };
      }

      const archivo = await generarExcel(datos, 'Reporte_Resumen_Clientes');

      const totalClientes = datos.reduce((sum, row) => sum + (row.total_clientes || 0), 0);

      const contenidoHtml = plantillaReporte('📋 Resumen de Clientes por Ciudad', [
        ...cajasFechaHora(),
        { label: '🏙️ Ciudades', valor: datos.length },
        { label: '👥 Total Clientes', valor: totalClientes }
      ]);

      await enviarEmail(
        `📋 Resumen Clientes - ${new Date().toLocaleDateString('es-ES')}`,
        contenidoHtml,
        archivo
      );

      logger.info('✅ Resumen de clientes completado');
      return {
        success: true,
        archivo: archivo.nombre,
        filas: archivo.filas,
        fecha: new Date()
      };

    } catch (error) {
      logger.error(`❌ Error en resumen de clientes: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ClientesService();
