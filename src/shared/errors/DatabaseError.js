const BaseError = require('./BaseError');

/**
 * Error de acceso a SQL Server (conexión o ejecución de query).
 * Envuelve el error crudo de tedious para no filtrar detalles internos
 * al cliente HTTP, conservando el mensaje original en los logs.
 */
class DatabaseError extends BaseError {
  constructor(message, cause) {
    super(message, 500);
    this.cause = cause;
  }
}

module.exports = DatabaseError;
