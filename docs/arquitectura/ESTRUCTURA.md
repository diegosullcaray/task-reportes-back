# Estructura del proyecto

Backend de reportes: sin login (no lo necesita todavía), pero con
seguridad de borde (helmet, cors, rate limit) porque cualquiera con la
URL puede llamar los endpoints. Cada reporte se puede disparar
manualmente por HTTP o corre solo por cron.

## Árbol de `src/`

```
src/
├── server.js                          # Entry point: valida BD/correo y levanta el server HTTP
│
├── config/                            # Configuración estática, no lógica de infraestructura
│   ├── env.js                         # Carga .env y valida variables requeridas
│   └── destinatarios.js               # Para/CC de cada reporte (override por variable de entorno)
│
├── infrastructure/                    # Todo lo que no es negocio: server, BD, correo, seguridad...
│   ├── database/database.js           # Conexión a SQL Server (tedious), una conexión por query
│   ├── email/mailer.js                # Transporte SMTP (nodemailer) y envío de correos
│   ├── logging/logger.js              # Logger winston (consola + logs/combined.log + logs/error.log)
│   ├── security/security.middleware.js # helmet + cors ("gateway" de esta misma app)
│   ├── rate-limit/RateLimiter.js       # apiLimiter (global) y reportesLimiter (endpoints pesados)
│   ├── documentation/                  # Swagger
│   │   ├── swagger.definition.js       # Spec OpenAPI 3.0 estático
│   │   └── documentation.routes.js     # Monta swagger-ui-express en /api-docs
│   ├── monitoring/health.routes.js     # GET /health y GET /api/info
│   ├── notifications/googleChat.service.js # Webhook a Google Chat (best-effort, no lanza excepción)
│   └── server/                         # Ensamblado de la app Express
│       ├── app.js                      # Arma middlewares + rutas + schedules + 404/error handler
│       ├── middlewares.js              # Orden de middlewares globales (ver más abajo)
│       ├── requestLogger.middleware.js # Loguea método + path de cada request
│       ├── errorHandler.js             # notFoundHandler (404) + errorHandler (centralizado)
│       └── routes.js                   # Router raíz: monta docs, monitoring y cada módulo
│
├── modules/                            # Dominio de negocio
│   ├── reportes/
│   │   ├── cartera-heredada/           # Un reporte = 5 archivos con el mismo prefijo
│   │   │   ├── *.controller.js         #   Recibe req.fechaCierre ya validado, llama al service
│   │   │   ├── *.routes.js             #   POST /generar-ahora (rate limit + validator + asyncHandler)
│   │   │   ├── *.service.js            #   Query BD → Excel → correo (la lógica real)
│   │   │   ├── *.query.js              #   SQL crudo del reporte
│   │   │   └── *.schedule.js           #   node-cron: cuándo corre solo, sin HTTP de por medio
│   │   ├── desembolso-canal/           # (mismo patrón)
│   │   ├── fondeo-estable/             # (mismo patrón)
│   │   ├── ratio-ce/                   # Variante SIN Excel: el resultado va como tablas HTML
│   │   │                               #   en el cuerpo del correo (reproduce la tabla dinámica)
│   │   ├── reporte-giancarlo/          # "Saca tu Garra": variación de saldo vigente,
│   │   │                               #   productividad y ratios de recuperación por asesor
│   │   ├── saldo-medio-vigente/        # Variante SIN Excel: valor total + tabla diaria en el correo
│   │   ├── saldo-puntual-medio/        # Excel con 2 hojas (generarExcelMultiHoja)
│   │   ├── saldo-vigente-agro/         # Excel con 3 hojas (actual / anterior / comparativo cierre)
│   │   ├── reporte-seguros/            # "Utilizas Seguros": penetración de seguros por producto
│   │   └── reportes.schedules.js       # Agrega los inicializarSchedules() de cada reporte en uno solo
│   ├── validaciones/
│   │   ├── control-cargas/             # GET a demanda + cron cada 5 min; notifica a Google Chat
│   │   │   ├── *.controller.js
│   │   │   ├── *.routes.js
│   │   │   ├── *.service.js            #   valida cargas y notifica a Chat en cada ejecución
│   │   │   ├── *.query.js
│   │   │   └── *.schedule.js           #   node-cron cada 5 min (CONTROL_CARGAS_CRON)
│   │   └── validaciones.schedules.js   # Agrega los schedules del módulo validaciones
│   └── schedules.js                    # Agregador raíz: arranca schedules de reportes + validaciones
│
└── shared/                             # Reutilizable por cualquier módulo, sin lógica de negocio
    ├── errors/                         # BaseError → ValidationError (400) / DatabaseError (500)
    ├── http/asyncHandler.js            # Envuelve handlers async: reenvía errores a next(err)
    ├── validators/fecha.validator.js   # req.body.fecha → req.fechaCierre (o 400 vía ValidationError)
    └── utils/
        ├── html.js                     # Tablas HTML embebibles en correos (reportes sin Excel)
        ├── excel.js                    # Genera el .xlsx (exceljs) en xlsx_output/: generarExcel
        │                               #   (1 hoja) y generarExcelMultiHoja (N hojas, mismo formato)
        ├── fechas.js                   # Parseo/formato de fechas de cierre
        └── email-template.js           # HTML + firma corporativa de los correos de reporte
```

## Por qué esta separación

- **`infrastructure/`** = cómo corre la app (Express, BD, correo, seguridad, logging). No sabe nada
  de "cartera heredada" ni de reportes.
- **`modules/`** = qué hace la app (el negocio). Cada carpeta de reporte es autocontenida: controller,
  routes, service, query y schedule viven juntos y no se filtran a otros módulos.
- **`shared/`** = piezas genéricas que varios módulos reusan (validación de fecha, manejo de errores,
  generación de Excel). Si algo se repite en 2+ módulos, va acá; si es de un solo módulo, se queda
  dentro de ese módulo.
- **`config/`** = valores/listas estáticas (variables de entorno parseadas, destinatarios). No tiene
  lógica de conexión ni de negocio, solo datos de configuración.

## Flujo de una request manual (ej. `POST /api/reportes/desembolso-canal/generar-ahora`)

```
routes.js (infrastructure/server)
  → middlewares.js: helmet/cors → compression → json/urlencoded → apiLimiter (100/15min) → requestLogger
  → desembolso-canal.routes.js: reportesLimiter (5/15min) → validarFechaCierre → asyncHandler(controller)
  → desembolso-canal.controller.js: llama al service con req.fechaCierre
  → desembolso-canal.service.js: query SQL → generarExcel → enviarEmail
  → si algo lanza error, asyncHandler lo reenvía a errorHandler.js (respuesta JSON consistente)
```

## Flujo de una tarea programada (cron)

```
server.js → require('./infrastructure/server/app') → app.js → inicializarSchedules()
  → modules/schedules.js → reportes.schedules.js + validaciones.schedules.js
  → cada *.schedule.js → node-cron dispara → *.service.js (mismo código que el manual)
```

Reportes mensuales: cron mensual (día 1-3). Control de cargas: cron cada 5 minutos que
consulta el estado y notifica el resultado a Google Chat (webhook), sin intervención manual.

## Convenciones

- Nombre de archivo = `<módulo>.<capa>.js` (ej. `desembolso-canal.service.js`), igual dentro de
  `modules/` que en `infrastructure/` cuando aplica (`requestLogger.middleware.js`).
- Los `service.js` nunca responden HTTP directamente: devuelven `{ success, ... }` y es el
  `controller.js` quien decide el status code.
- Los `controller.js` no tienen `try/catch`: cualquier error se reenvía solo gracias a
  `asyncHandler` (`shared/http/asyncHandler.js`) envolviendo el handler en `*.routes.js`.
- Nada de autenticación todavía — la única protección de borde son los rate limiters. Si en algún
  momento se agrega login, debería vivir en un módulo nuevo (`modules/auth/`) sin tocar esta
  estructura.
