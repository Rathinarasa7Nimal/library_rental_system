const mongoose = require("mongoose");

const CATEGORIES = ["Fiction", "Non-Fiction", "Academic", "Comics"];
const FORMATS = ["Hardcover", "Paperback", "E-Book"];

/**
 * Each format has its own per-day rental price and its own copies count,
 * so the same title can be available as e.g. Hardcover (3 copies) and
 * E-Book (unlimited-style high count) at different rental rates.
 */
const formatOptionSchema = new mongoose.Schema(
  {
    format: { type: String, enum: FORMATS, required: true },
    pricePerDay: { type: Number, required: true, min: 0 },
    copies: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    author: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    // GridFS file id for the cover image (see middleware/upload.js)
    coverImageId: { type: mongoose.Schema.Types.ObjectId, default: null },
    category: { type: String, enum: CATEGORIES, required: true },
    formats: {
      type: [formatOptionSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
  },
  { timestamps: true }
);

// Text index powers the "search by title/author/description" requirement
bookSchema.index({ title: "text", author: "text", description: "text" });

// Virtual: total copies across all formats, used for "availability" filter
bookSchema.virtual("totalCopies").get(function () {
  return this.formats.reduce((sum, f) => sum + f.copies, 0);
});
bookSchema.set("toJSON", { virtuals: true });
bookSchema.set("toObject", { virtuals: true });

bookSchema.statics.CATEGORIES = CATEGORIES;
bookSchema.statics.FORMATS = FORMATS;

module.exports = mongoose.model("Book", bookSchema);
