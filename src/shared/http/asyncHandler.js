/**
 * Envuelve un handler async de Express y reenvía cualquier error a
 * next(err) para que lo resuelva el errorHandler centralizado, evitando
 * repetir try/catch en cada controller.
 * @param {Function} fn - (req, res, next) => Promise
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
