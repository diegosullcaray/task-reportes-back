/**
 * Error base para errores operacionales (esperados) de la aplicación.
 * Los controllers no necesitan capturarlos: asyncHandler los reenvía al
 * errorHandler centralizado, que usa statusCode para la respuesta HTTP.
 */
class BaseError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = BaseError;
