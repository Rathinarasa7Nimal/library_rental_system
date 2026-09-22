const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");

/**
 * `protect` - requires a valid JWT (Authorization: Bearer <token>).
 * Attaches the authenticated user (minus password) to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
  if (!token) throw new ApiError(401, "Not authenticated");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "User no longer exists");
  req.user = user;
  next();
});

/**
 * `identify` - optional auth. If a valid token is present, req.user is set
 * (same as `protect`). If not, req.guestId is read from an `x-guest-id`
 * header instead, so the cart works for logged-out users too
 * ("Allow adding to cart even when not logged in").
 */
const identify = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
        return next();
      }
    } catch {
      /* fall through to guest handling */
    }
  }

  const guestId = req.headers["x-guest-id"];
  if (!guestId) throw new ApiError(400, "Missing x-guest-id header for guest cart");
  req.guestId = guestId;
  next();
});

/**
 * `restrictTo("admin")` - role-based authorization, used after `protect`.
 * Same reusable pattern for any role list, e.g. restrictTo("admin","user").
 */
const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }
    next();
  };

module.exports = { protect, identify, restrictTo };
