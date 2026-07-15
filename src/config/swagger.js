/**
 * Especificación OpenAPI 3.0 para Swagger UI (/api-docs).
 * Documenta las tareas manuales del backend de reportes.
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
                emailEnviado: { type: 'boolean', example: true }
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
