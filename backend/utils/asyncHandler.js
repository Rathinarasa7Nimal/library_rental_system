/**
 * Wraps an async route function so any thrown/rejected error is forwarded
 * to Express's error middleware, instead of needing try/catch in every
 * controller. Every controller in this project is written as:
 *   exports.fn = asyncHandler(async (req, res) => { ... })
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
