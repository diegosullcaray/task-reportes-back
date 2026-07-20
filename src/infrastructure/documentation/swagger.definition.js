/**
 * Especificación OpenAPI 3.0 para Swagger UI (/api-docs).
 * Documenta las tareas manuales del backend de reportes y validaciones.
 */

const bodyFecha = {
  required: false,
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          fecha: {
            type: 'string',
            example: '20260630',
            description: 'Fecha de cierre en formato YYYYMMDD o YYYY-MM-DD. Si se omite, se usa el fin del mes anterior.'
          }
        }
      }
    }
  }
};

const respuestas = (descripcion200) => ({
  200: {
    description: descripcion200,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            mensaje: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                archivo: { type: 'string', example: 'Desembolsos_canal_20260630.xlsx' },
                filas: { type: 'integer', example: 1250 },
                fechaCierre: { type: 'string', example: '20260630' },
                correo: {
                  type: 'object',
                  description: 'Detalle del proceso de envío del correo',
                  properties: {
                    enviado: { type: 'boolean', example: true },
                    asunto: { type: 'string', example: 'Desembolso Canal - 20260630' },
                    para: { type: 'string', example: 'sergio.sandoval@confianza.pe, sebastien.puertas@confianza.pe' },
                    cc: { type: 'string', example: 'abigail.jaimes@confianza.pe, michael.palacios@confianza.pe' },
                    adjunto: { type: 'string', example: 'Desembolsos_canal_20260630.xlsx' },
                    messageId: { type: 'string', example: '<abc123@confianza.pe>' },
                    error: { type: 'string', description: 'Motivo del fallo cuando enviado=false' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  400: {
    description: 'Fecha inválida o sin datos para el cierre indicado',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            mensaje: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    }
  },
  500: {
    description: 'Error interno (BD no disponible, fallo generando Excel, etc.)',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' }
          }
        }
      }
    }
  }
});

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Backend de Reportes Mensuales',
    version: '2.0.0',
    description: 'API sin autenticación para ejecutar manualmente los reportes mensuales '
      + '(también corren como tareas programadas). Cada reporte consulta SQL Server, '
      + 'genera un Excel en xlsx_output/ y lo envía por correo a sus destinatarios.'
  },
  servers: [
    { url: '/', description: 'Este servidor (funciona con localhost o con la IP de la máquina)' }
  ],
  tags: [
    { name: 'Reportes Mensuales', description: 'Ejecución manual de los reportes (por defecto al cierre del mes anterior)' },
    { name: 'Validaciones', description: 'Control de cargas y verificaciones clave de base de datos' },
    { name: 'Utilidad', description: 'Health check e información de la API' }
  ],
  paths: {
    '/api/reportes/cartera-heredada/generar-ahora': {
      post: {
        tags: ['Reportes Mensuales'],
        summary: 'Cartera Heredada PDM',
        description: 'Genera el stock mensual de cartera heredada PDM y lo envía a Abigail Jaimes, '
          + 'Karla Campos, Ricardo Lazo y Alvaro Calderon (Cc: Michael Palacios). '
          + 'Adjunto: "PDM Heredado <Mes> <YY>.xlsx". '
          + '⚠️ Requiere que la data del cubo y PDM estén completadas en el Servidor 213. '
          + 'Programado: día 2 de cada mes 9:00 AM.',
        requestBody: bodyFecha,
        responses: respuestas('Reporte generado y enviado por correo')
      }
    },
    '/api/reportes/desembolso-canal/generar-ahora': {
      post: {
        tags: ['Reportes Mensuales'],
        summary: 'Desembolso Canal',
        description: 'Genera los desembolsos por canal (BT/CT) al cierre de mes y los envía a '
          + 'Sergio Sandoval y Sebastien Puertas (Cc: Abigail Jaimes, Michael Palacios). '
          + 'Adjunto: "Desembolsos_canal_<YYYYMMDD>.xlsx". '
          + 'Programado: día 1 de cada mes 2:30 PM.',
        requestBody: bodyFecha,
        responses: respuestas('Reporte generado y enviado por correo')
      }
    },
    '/api/reportes/fondeo-estable/generar-ahora': {
      post: {
        tags: ['Reportes Mensuales'],
        summary: 'Fondeo Estable',
        description: 'Genera el saldo de fondeo estable al cierre de mes y lo envía a Eddy Martinez '
          + '(Cc: Michael Palacios, Abigail Jaimes). '
          + 'Adjunto: "Saldo_FondeoEstable_<YYYYMMDD>.xlsx". '
          + 'Programado: día 1 de cada mes 9:00 AM.',
        requestBody: bodyFecha,
        responses: respuestas('Reporte generado y enviado por correo')
      }
    },
    '/api/reportes/ratio-ce/generar-ahora': {
      post: {
        tags: ['Reportes Mensuales'],
        summary: 'Ratio CE, Clientes Nuevos y Migrantes',
        description: 'Genera el "Datos Cierre" mensual: Ratio CE (desembolsos habilitados vs CE) y '
          + 'la tabla dinámica de clientes nuevos por condición migratoria (Peruano/Migrante) y zona '
          + '(Rural/Urbano/Indeterminado). '
          + '⚠️ A diferencia de los otros reportes NO adjunta Excel: el resultado va como tablas HTML '
          + 'en el cuerpo del correo (asunto "Datos Cierre - <YYYYMMDD>"). '
          + 'Programado: día 3 de cada mes 9:00 AM.',
        requestBody: bodyFecha,
        responses: respuestas('Reporte generado y enviado por correo (tablas en el cuerpo, sin adjunto)')
      }
    },
    '/api/reportes/reporte-giancarlo/generar-ahora': {
      post: {
        tags: ['Reportes Mensuales'],
        summary: 'Saca tu Garra (Reporte Giancarlo)',
        description: 'Genera la variación de saldo vigente, productividad y ratios de recuperación (0-30 y 1-30) '
          + 'por asesor al cierre de mes y lo envía a Giancarlo Hijar (Cc: Michael Palacios, Abigail Jaimes). '
          + 'Adjunto: "Base Saca tu Garra_<YYYYMMDD>.xlsx". '
          + 'Programado: día 2 de cada mes 10:00 AM.',
        requestBody: bodyFecha,
        responses: respuestas('Reporte generado y enviado por correo')
      }
    },
    '/api/reportes/saldo-medio-vigente/generar-ahora': {
      post: {
        tags: ['Reportes Mensuales'],
        summary: 'Saldo Medio Vigente (Diana)',
        description: 'Genera el saldo medio vigente total al cierre de mes junto con su detalle diario y lo envía '
          + 'a Diana García (Cc: Michael Palacios, Jorge Mercedes). '
          + '⚠️ A diferencia de los otros reportes NO adjunta Excel: el resultado va en el cuerpo del correo '
          + '(asunto "Saldo Medio Vigente - <Mes Año>"). '
          + 'Programado: día 3 de cada mes 10:00 AM.',
        requestBody: bodyFecha,
        responses: respuestas('Reporte generado y enviado por correo (sin adjunto)')
      }
    },
    '/api/reportes/saldo-puntual-medio/generar-ahora': {
      post: {
        tags: ['Reportes Mensuales'],
        summary: 'Saldo Puntual - Saldo Medio (Giovani)',
        description: 'Genera el saldo puntual y el saldo medio por agencia y producto al cierre de mes. '
          + 'Adjunto: "Saldo_puntual-Saldo_Medio_<YYYYMMDD>.xlsx" con 2 hojas (Saldo Puntual / Saldo Medio). '
          + 'Programado: día 4 de cada mes 9:00 AM.',
        requestBody: bodyFecha,
        responses: respuestas('Reporte generado y enviado por correo')
      }
    },
    '/api/reportes/saldo-vigente-agro/generar-ahora': {
      post: {
        tags: ['Reportes Mensuales'],
        summary: 'Saldo Vigente - Producto Agro (Giovani)',
        description: 'Genera el saldo vigente del producto Agro al cierre de mes, el del mes anterior y el '
          + 'comparativo de cierre de operaciones por jerarquía comercial. '
          + 'Adjunto: "Cartera_VigenteAgro_<YYYYMMDD>.xlsx" con 3 hojas. '
          + 'Programado: día 4 de cada mes 10:00 AM.',
        requestBody: bodyFecha,
        responses: respuestas('Reporte generado y enviado por correo')
      }
    },
    '/api/reportes/reporte-seguros/generar-ahora': {
      post: {
        tags: ['Reportes Mensuales'],
        summary: 'Utilizas Seguros (Giovani)',
        description: 'Genera la penetración de seguros por producto (Cartera vs Seguro) y nivel comercial al '
          + 'cierre de mes. Adjunto: "Reporte Seguros <YYYYMMDD>.xlsx". '
          + 'Programado: día 4 de cada mes 11:00 AM.',
        requestBody: bodyFecha,
        responses: respuestas('Reporte generado y enviado por correo')
      }
    },
    '/api/validaciones/control-cargas': {
      get: {
        tags: ['Validaciones'],
        summary: 'Obtiene el estado de las cargas de datos',
        description: 'Retorna un reporte detallando qué tareas de carga están pendientes, su estado actual y valida de forma prioritaria si las carteras activas y pasivas ya finalizaron.',
        responses: {
          200: {
            description: 'Estado de cargas obtenido y validado exitosamente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    resumenCritico: {
                      type: 'object',
                      properties: {
                        carterasActivasYPasivasListas: { type: 'boolean', example: true },
                        mensaje: { type: 'string', example: '✅ Excelente. Las carteras activas y pasivas han finalizado sus cargas correctamente.' },
                        procesosCriticosEvaluados: { type: 'array', items: { type: 'object' } }
                      }
                    },
                    totales: {
                      type: 'object',
                      properties: {
                        totalProcesos: { type: 'integer', example: 10 },
                        pendientes: { type: 'integer', example: 0 },
                        finalizados: { type: 'integer', example: 10 }
                      }
                    },
                    procesosPendientes: { type: 'array', items: { type: 'object' } },
                    procesosFinalizados: { type: 'array', items: { type: 'object' } }
                  }
                }
              }
            }
          },
          500: {
            description: 'Error al consultar la base de datos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Fallo al ejecutar procedimiento almacenado' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/health': {
      get: {
        tags: ['Utilidad'],
        summary: 'Health check',
        description: 'Estado del servidor y de la conexión a la base de datos.',
        responses: {
          200: {
            description: 'Estado del servidor',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    baseDatos: { type: 'string', example: 'CONECTADA' },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number', example: 3600 }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/info': {
      get: {
        tags: ['Utilidad'],
        summary: 'Información de la API',
        description: 'Lista los reportes disponibles con sus endpoints, links y horarios programados.',
        responses: {
          200: { description: 'Información de reportes, endpoints y schedules' }
        }
      }
    }
  }
};