const BaseError = require('./BaseError');

/**
 * Error de validación de entrada (400). Ej. fecha con formato inválido.
 */
class ValidationError extends BaseError {
  constructor(message) {
    super(message, 400);
  }
}

module.exports = ValidationError;
