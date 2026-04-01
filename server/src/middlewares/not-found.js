function notFound(req, res) {
  res.status(404).json({
    message: "Маршрут не знайдено",
  });
}

module.exports = notFound;
