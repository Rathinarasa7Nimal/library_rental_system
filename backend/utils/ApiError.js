/**
 * Uniform error shape thrown from anywhere in the app and turned into a
 * consistent JSON response by middleware/errorHandler.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
module.exports = ApiError;
