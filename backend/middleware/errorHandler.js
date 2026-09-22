/**
 * Centralized error handler - every controller uses asyncHandler + ApiError,
 * so all errors funnel here into one consistent JSON response shape.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  if (statusCode === 500) console.error(err);
  res.status(statusCode).json({
    success: false,
    message: err.message || "Server error",
  });
}
module.exports = errorHandler;
