const mongoose = require("mongoose");

const RENT_DAYS = 14;

const orderLineSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    title: { type: String, required: true }, // snapshot, survives later book edits
    format: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    pricePerDay: { type: Number, required: true },
    lineFee: { type: Number, required: true }, // days * pricePerDay * count
  },
  { _id: false }
);

const rentOrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    books: { type: [orderLineSchema], required: true },
    rentDate: { type: Date, required: true, default: Date.now },
    rentCloseDate: { type: Date, required: true },
    totalFee: { type: Number, required: true },
    status: { type: String, enum: ["active", "returned", "overdue"], default: "active" },
  },
  { timestamps: true }
);

rentOrderSchema.statics.RENT_DAYS = RENT_DAYS;

module.exports = mongoose.model("RentOrder", rentOrderSchema);
