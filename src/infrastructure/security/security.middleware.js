const helmet = require('helmet');
const cors = require('cors');

/**
 * Middlewares de seguridad de borde ("gateway" de esta misma app):
 * - helmet: cabeceras HTTP de seguridad. Se desactiva contentSecurityPolicy
 *   porque bloquea los assets inline que usa swagger-ui-express en /api-docs.
 * - cors: sin login no hay cookies/sesión que proteger; el origen permitido
 *   es configurable vía CORS_ORIGIN (por defecto abierto) para no bloquear
 *   a los clientes internos que consumen esta API.
 */
function securityMiddleware() {
  const corsOrigin = process.env.CORS_ORIGIN;

  return [
    helmet({ contentSecurityPolicy: false }),
    cors({ origin: corsOrigin ? corsOrigin.split(',').map(o => o.trim()) : true })
  ];
}

module.exports = securityMiddleware;
