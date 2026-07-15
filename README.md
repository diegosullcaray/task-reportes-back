# 📊 Backend Modular de Reportes

Backend en **Node.js + Express** que automatiza la generación, envío y almacenamiento de reportes desde **SQL Server**.

> ⚠️ Este backend **no tiene login/autenticación**: su función es ejecutar **tareas manuales** (vía endpoints HTTP) y **tareas programadas** (vía cron) que generan reportes Excel y los envían por email.

## Características

- ✅ **100% Modular** — cada reporte es independiente (query / service / controller / schedule)
- ✅ **SQL Server** — conexión con tedious (Windows Auth o SQL Auth)
- ✅ **Tareas programadas** — cron jobs con node-cron
- ✅ **Tareas manuales** — endpoints HTTP para ejecutar reportes al instante
- ✅ **Excel automático** — exporta con formato (ExcelJS)
- ✅ **Email automático** — envía vía Gmail (Nodemailer)
- ✅ **Almacenamiento local** — guarda los .xlsx en `xlsx_output/`
- ✅ **Logging centralizado** — Winston (`logs/`)

## Instalación

```bash
npm install
cp .env.example .env   # editar con los valores reales
npm run dev            # desarrollo (nodemon)
npm start              # producción
```

## Configuración (.env)

| Variable | Descripción |
|---|---|
| `DB_SERVER` / `DB_DATABASE` | Servidor y base de datos SQL Server |
| `DB_USERNAME` / `DB_PASSWORD` | Vacíos = Windows Auth; con valores = SQL Auth |
| `EMAIL_USER` / `EMAIL_PASSWORD` | Gmail + contraseña de aplicación (16 dígitos) |
| `EMAIL_RECIPIENT` | Destinatario de los reportes |
| `TZ_SCHEDULES` | Zona horaria de los cron jobs (ej. `America/Lima`) |
| `PORT` | Puerto HTTP (default 3000) |

## Tareas manuales (endpoints HTTP)

### Ventas
- `POST /api/reportes/ventas/generar-ahora` — reporte de ventas del día
- `POST /api/reportes/ventas/por-rango` — body: `{"fechaInicio":"2024-01-01","fechaFin":"2024-01-31"}`
- `GET /api/reportes/ventas/top-productos?dias=30` — top 10 productos

### Clientes
- `POST /api/reportes/clientes/nuevos` — body opcional: `{"dias":7}`
- `GET /api/reportes/clientes/inactivos?dias=30`
- `POST /api/reportes/clientes/resumen` — resumen por ciudad

### Inventario
- `POST /api/reportes/inventario/stock-bajo`
- `GET /api/reportes/inventario/total`
- `POST /api/reportes/inventario/movimientos` — body: `{"fechaInicio":"...","fechaFin":"..."}`

### Utilidad
- `GET /health` — health check
- `GET /api/info` — lista de endpoints y schedules

## Tareas programadas (cron)

| Módulo | Tarea | Horario |
|---|---|---|
| Ventas | Reporte diario | Todos los días 8:00 AM |
| Ventas | Top 10 productos | Lunes 9:00 AM |
| Clientes | Clientes nuevos | Lunes 8:30 AM |
| Clientes | Clientes inactivos | Día 1 de cada mes 9:00 AM |
| Inventario | Alerta stock bajo | Todos los días 7:30 AM |
| Inventario | Inventario total | Viernes 5:00 PM |

Los horarios usan la zona horaria de `TZ_SCHEDULES` (o la del servidor si no se define).

## Estructura

```
src/
├── config/          # database.js, mailer.js, env.js
├── modules/
│   ├── ventas/      # *.query.js, *.service.js, *.controller.js, *.schedule.js
│   ├── clientes/
│   └── inventario/
├── utils/           # excel.js, email.js, logger.js
├── app.js           # Express + rutas + inicialización de schedules
└── index.js         # Punto de entrada
```

## Agregar un nuevo módulo de reporte

1. Crear carpeta `src/modules/<nombre>/` con los 4 archivos: `query`, `service`, `controller`, `schedule`
2. Registrar las rutas del controller en `src/app.js`
3. Llamar a `inicializarSchedules()` del módulo en `src/app.js`

## Testing manual

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/info
curl -X POST http://localhost:3000/api/reportes/ventas/generar-ahora
curl -X POST http://localhost:3000/api/reportes/ventas/por-rango \
  -H "Content-Type: application/json" \
  -d '{"fechaInicio":"2024-01-01","fechaFin":"2024-01-15"}'
```

## Logs

```bash
tail -f logs/combined.log   # todos los logs
tail -f logs/error.log      # solo errores
```

## Licencia

MIT
