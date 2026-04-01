function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Внутрішня помилка сервера";

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    message,
  });
}

module.exports = errorHandler;
