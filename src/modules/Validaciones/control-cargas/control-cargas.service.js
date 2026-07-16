const db = require('../../../config/database');
const queries = require('./control-cargas.query');
const logger = require('../../../utils/logger');

class ControlCargasService {
  /**
   * Obtiene el estado de las cargas y realiza validaciones clave
   */
  async validarCargas() {
    try {
      logger.info('🔄 [CONTROL CARGAS] Consultando estado de cargas en BD...');
      
      const resultados = await db.ejecutarQuery(queries.obtenerEstadoProcesos());
      
      if (!resultados || resultados.length === 0) {
        return {
          success: false,
          mensaje: 'No se encontraron registros de procesos al ejecutar mod_rep.com.RSRPD001'
        };
      }

      // Filtrar filas válidas que contengan la descripción del proceso (des_pro)
      const procesosValidos = resultados.filter(r => r.des_pro);

      const procesosMapeados = procesosValidos.map(p => ({
        proceso: p.des_pro.trim(),
        fechaActividad: p.fec_act,
        fechaReporte: p.fec_rep,
        estado: p.est_pro ? p.est_pro.trim() : 'DESCONOCIDO'
      }));

      // Identificar procesos críticos: Carteras Activas y Pasivas (búsqueda flexible)
      const procesosCriticos = procesosMapeados.filter(p => {
        const nombreLower = p.proceso.toLowerCase();
        return (
          (nombreLower.includes('activa') || nombreLower.includes('pasiva')) &&
          nombreLower.includes('cartera')
        );
      });

      // Si no encuentra coincidencia exacta con el término "cartera", buscar de manera general por "activa" / "pasiva"
      const procesosCriticosAlternos = procesosCriticos.length > 0 
        ? procesosCriticos 
        : procesosMapeados.filter(p => {
            const nombreLower = p.proceso.toLowerCase();
            return nombreLower.includes('activa') || nombreLower.includes('pasiva');
          });

      // Validar si todos los procesos críticos finalizaron con éxito
      // (Asumiendo que el estado finalizado es "FINALIZADO" o similar, p.ej. "OK" o "COMPLETADO")
      const finalizoEstadoExitoso = (estado) => {
        const est = estado.toUpperCase();
        return est === 'FINALIZADO' || est === 'OK' || est === 'COMPLETADO' || est === 'TERMINADO';
      };

      const criticosFinalizados = procesosCriticosAlternos.length > 0 
        ? procesosCriticosAlternos.every(p => finalizoEstadoExitoso(p.estado))
        : false;

      // Clasificar el resto de las tareas (pendientes y finalizadas)
      const pendientes = procesosMapeados.filter(p => !finalizoEstadoExitoso(p.estado));
      const finalizadas = procesosMapeados.filter(p => finalizoEstadoExitoso(p.estado));

      return {
        success: true,
        resumenCritico: {
          carterasActivasYPasivasListas: criticosFinalizados,
          mensaje: criticosFinalizados 
            ? '✅ Excelente. Las carteras activas y pasivas han finalizado sus cargas correctamente.' 
            : '⚠️ Alerta: Hay carteras de activos/pasivos pendientes o con error.',
          procesosCriticosEvaluados: procesosCriticosAlternos
        },
        totales: {
          totalProcesos: procesosMapeados.length,
          pendientes: pendientes.length,
          finalizados: finalizadas.length
        },
        procesosPendientes: pendientes,
        procesosFinalizados: finalizadas
      };

    } catch (error) {
      logger.error(`❌ [CONTROL CARGAS] Error al validar cargas: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ControlCargasService();