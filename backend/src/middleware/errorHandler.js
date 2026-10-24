export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    message: status >= 500 ? 'Something went wrong on the server.' : err.message,
    ...(err.details ? { details: err.details } : {}),
  });
}