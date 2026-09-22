const mongoose = require("mongoose");

/**
 * "Temporary Cart table": one row per (user, book, format).
 * Guest (not-logged-in) carts are supported via a guestId cookie/localStorage
 * key instead of userId - see middleware/auth.js `identify`.
 */
const cartItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    guestId: { type: String, default: null },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    format: { type: String, required: true },
    count: { type: Number, required: true, min: 1, default: 1 },
  },
  { timestamps: true }
);

cartItemSchema.index({ userId: 1, bookId: 1, format: 1 });
cartItemSchema.index({ guestId: 1, bookId: 1, format: 1 });

module.exports = mongoose.model("CartItem", cartItemSchema);
