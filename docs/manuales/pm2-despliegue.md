# Desplegar el backend de reportes con PM2

Guía rápida para levantar, actualizar y administrar `reportes-backend` con
PM2 (útil para correrlo como servicio dentro de un contenedor o servidor,
sin depender de una terminal abierta).

El proceso se registra con el nombre **`reportes-backend`** — usa ese
nombre en todos los comandos de esta guía.

## 1. Requisitos previos

- Node.js instalado (ver `engines.node` en `package.json`, mínimo v16).
- Archivo `.env` en la raíz del proyecto con las variables reales
  (copiar desde `.env.example` y completar).
- PM2 instalado globalmente:

```bash
npm install -g pm2
```

- Dependencias del proyecto instaladas:

```bash
npm install
```

## 2. Arrancar el servidor

Desde la raíz del proyecto:

```bash
pm2 start src/server.js --name reportes-backend
```

Verificar que quedó arriba:

```bash
pm2 status
```

## 3. Ver logs

```bash
pm2 logs reportes-backend
```

Solo los logs de error:

```bash
pm2 logs reportes-backend --err
```

(La app también escribe sus propios logs en `logs/combined.log` y
`logs/error.log`, independientemente de PM2.)

## 4. Actualizar el código (nueva versión)

```bash
git pull
npm install
pm2 restart reportes-backend
```

`pm2 restart` reinicia el proceso completo (hay un corte breve). Si se
necesita cero downtime y el proceso corre en modo cluster, usar
`pm2 reload reportes-backend` en su lugar; con un solo proceso en modo
`fork` (el caso por defecto de `pm2 start`) el resultado es el mismo que
`restart`.

## 5. Reiniciar sin cambiar código

Útil si el servidor quedó en un estado raro (ej. perdió la conexión a
SQL Server y no reintenta):

```bash
pm2 restart reportes-backend
```

## 6. Detener y eliminar

Detener (el proceso queda listado pero parado, se puede volver a arrancar
con `pm2 start reportes-backend`):

```bash
pm2 stop reportes-backend
```

Eliminar por completo de la lista de PM2:

```bash
pm2 delete reportes-backend
```

## 7. Arranque automático al reiniciar el servidor/contenedor

Para que PM2 vuelva a levantar `reportes-backend` automáticamente si el
servidor se reinicia:

```bash
pm2 save
pm2 startup
```

`pm2 startup` imprime un comando (depende del sistema operativo) que hay
que ejecutar una sola vez para registrar PM2 como servicio del sistema.
`pm2 save` guarda la lista de procesos actuales para que se restauren.

Si luego se elimina o agrega un proceso, volver a correr `pm2 save` para
actualizar la lista guardada.

## 8. Otros comandos útiles

| Comando | Qué hace |
|---|---|
| `pm2 list` | Lista todos los procesos administrados por PM2 |
| `pm2 describe reportes-backend` | Detalle del proceso (memoria, uptime, reinicios) |
| `pm2 monit` | Monitor en vivo de CPU/memoria |
| `pm2 flush` | Limpia los logs acumulados de PM2 |
| `pm2 restart reportes-backend --update-env` | Reinicia releyendo variables de entorno del shell actual |

## Notas

- Las variables de entorno se cargan desde `.env` vía `dotenv`
  (`src/config/env.js`), no desde PM2 — no hace falta pasar `--env` ni
  configurar variables en PM2, basta con que el archivo `.env` exista
  junto a `package.json`.
- Las tareas programadas (cron de los reportes mensuales) se inicializan
  dentro del propio proceso Node al arrancar (`inicializarSchedules()` en
  `src/infrastructure/server/app.js`); no se administran desde PM2, así
  que solo debe correr **una** instancia del proceso (no usar modo
  `cluster` con varias instancias, porque cada una dispararía los mismos
  cron por separado).
