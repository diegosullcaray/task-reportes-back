# 📊 Backend de Reportes Mensuales — Financiera Confianza

Backend en **Node.js + Express** que automatiza la generación y envío por correo de los reportes mensuales desde **SQL Server** (Servidor 213).

> ⚠️ Este backend **no tiene login/autenticación**: su función es ejecutar **tareas manuales** (vía endpoints HTTP) y **tareas programadas** (vía cron) que generan los reportes Excel y los envían por correo desde `diego.sullcaray@confianza.pe`.

## Reportes mensuales

Los tres reportes usan como fecha de cierre el **fin del mes anterior** (ej. si corre el 1 de julio, cierre = `20260630`). Documentación fuente en `.docs/MENSUALES/`.

| Reporte | Asunto del correo | Adjunto | Para | Cc | Schedule |
|---|---|---|---|---|---|
| **Cartera Heredada PDM** | `Cartera Heredada PDM - Stock Junio 2026` | `PDM Heredado Junio 26.xlsx` | Abigail Jaimes, Karla Campos, Ricardo Lazo, Alvaro Calderon | Michael Palacios | Día 2 de cada mes, 9:00 AM |
| **Desembolso Canal** | `Desembolso Canal - 20260630` | `Desembolsos_canal_20260630.xlsx` | Sergio Sandoval, Sebastien Puertas | Abigail Jaimes, Michael Palacios | Día 1 de cada mes, 2:30 PM |
| **Fondeo Estable** | `Fondeo Estable - 20260630` | `Saldo_FondeoEstable_20260630.xlsx` | Eddy Martinez | Michael Palacios, Abigail Jaimes | Día 1 de cada mes, 9:00 AM |

> 📌 **Cartera Heredada PDM** requiere que toda la data del cubo y PDM estén completadas en el Servidor 213; por eso corre el día 2. Si aún no está lista, relanzar manualmente con el endpoint.

## Documentación Swagger

Con el servidor corriendo, la documentación interactiva está en:

```
http://localhost:3000/api-docs
```

Desde ahí se puede ver y **ejecutar** cada endpoint con "Try it out" (destinatarios, adjuntos y horarios incluidos en la descripción de cada reporte).

## Arranque

Al iniciar, el servidor **primero verifica la conexión a SQL Server** y luego muestra los links de todos los endpoints:

```
🔍 Verificando conexión a SQL Server (MISHWBDDES01 / storage, Windows Auth: BCF\TDSUR100)...
✓ Conexión SQL Server verificada
...
📖 Documentación Swagger: http://<ip-de-tu-máquina>:3000/api-docs
🔗 Links de las tareas manuales (POST): ...
```

El servidor escucha en `0.0.0.0`, así que los endpoints son accesibles tanto por `localhost` como por la IP de la máquina en la red (los links del arranque ya muestran la IP real).

Si la BD no responde, el servidor arranca igual (los reportes reintentan la conexión en cada ejecución) y el estado se refleja en `GET /health` (`baseDatos: CONECTADA | SIN CONEXIÓN`).

## Tareas manuales (endpoints HTTP)

Todas aceptan un body opcional `{ "fecha": "20260630" }` (o `"2026-06-30"`) para regenerar un cierre específico; sin body usan el fin del mes anterior.

```bash
POST /api/reportes/cartera-heredada/generar-ahora
POST /api/reportes/desembolso-canal/generar-ahora
POST /api/reportes/fondeo-estable/generar-ahora

GET /health      # health check + estado de la BD
GET /api/info    # lista de reportes con links, endpoints y horarios
GET /api-docs    # documentación Swagger interactiva
```

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/reportes/fondeo-estable/generar-ahora \
  -H "Content-Type: application/json" \
  -d '{"fecha":"20260630"}'
```

## Instalación

```bash
npm install
cp .env.example .env   # editar con los valores reales
npm run dev            # desarrollo (nodemon)
npm start              # producción
```

## Configuración (.env)

La conexión a SQL Server usa los **mismos datos que la ventana "Connect to Server" de SSMS**. Para Windows Authentication (ej. `BCF\TDSUR100` contra `MISHWBDDES01`):

```env
DB_SERVER=MISHWBDDES01
DB_DATABASE=storage
DB_DOMAIN=BCF
DB_USERNAME=TDSUR100
DB_PASSWORD=tu-contraseña-de-windows
DB_ENCRYPTION=false
DB_TRUST_CERTIFICATE=true
```

| Variable | Descripción |
|---|---|
| `DB_SERVER` / `DB_DATABASE` | Nombre del servidor (como en SSMS) y base inicial (las queries usan nombres calificados: `storage`, `dma`, `dwh`) |
| `DB_DOMAIN` | Dominio Windows (ej. `BCF`). Con valor → Windows Authentication (NTLM), igual que SSMS. Vacío → SQL Auth |
| `DB_USERNAME` / `DB_PASSWORD` | Usuario y contraseña (de Windows si hay dominio, de SQL si no) |
| `DB_INSTANCE` / `DB_PORT` | Instancia con nombre (ej. `SQLEXPRESS`) o puerto fijo (default 1433) |
| `EMAIL_USER` / `EMAIL_PASSWORD` | `diego.sullcaray@confianza.pe` + contraseña de aplicación de Google (16 dígitos) |
| `EMAIL_FIRMA_NOMBRE` / `EMAIL_FIRMA_CARGO` | Firma que aparece en los correos |
| `CARTERA_HEREDADA_PARA` / `_CC`, `DESEMBOLSO_CANAL_PARA` / `_CC`, `FONDEO_ESTABLE_PARA` / `_CC` | Sobreescriben los destinatarios por defecto (listas separadas por comas) |
| `TZ_SCHEDULES` | Zona horaria de los cron jobs (`America/Lima`) |
| `HOST` / `PORT` | Dónde escucha el servidor. `HOST=0.0.0.0` (default) lo hace accesible desde la red por la IP de la máquina |

## Estructura

```
src/
├── config/
│   ├── database.js        # Conexión SQL Server (tedious)
│   ├── mailer.js          # Envío de correos (Para/Cc/adjuntos)
│   ├── destinatarios.js   # Destinatarios de cada reporte
│   └── env.js             # Carga y validación de .env
├── modules/
│   ├── cartera-heredada/  # *.query.js, *.service.js, *.controller.js, *.schedule.js
│   ├── desembolso-canal/
│   └── fondeo-estable/
├── utils/
│   ├── excel.js           # Generador de Excel (ExcelJS)
│   ├── email.js           # Plantilla HTML corporativa + firma
│   ├── fechas.js          # Fin de mes anterior, formatos YYYYMMDD, meses
│   └── logger.js          # Winston
├── app.js                 # Express + rutas + inicialización de schedules
└── index.js               # Punto de entrada

.docs/MENSUALES/           # SQL, Excel y correos de ejemplo de cada reporte
xlsx_output/               # Excel generados
logs/                      # Logs de ejecución
```

## Agregar un nuevo reporte

1. Crear carpeta `src/modules/<nombre>/` con los 4 archivos: `query`, `service`, `controller`, `schedule`
2. Agregar sus destinatarios en `src/config/destinatarios.js`
3. Registrar la ruta y el schedule en `src/app.js`

## Logs

```bash
tail -f logs/combined.log   # todos los logs
tail -f logs/error.log      # solo errores
```

## Licencia

MIT
