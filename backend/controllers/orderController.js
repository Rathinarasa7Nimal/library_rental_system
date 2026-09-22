const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const CartItem = require("../models/Cart");
const Book = require("../models/Book");
const RentOrder = require("../models/RentOrder");
const { RENT_DAYS, calcLineFee, calcTotalFee } = require("../utils/fee");
const { sendRentalConfirmation } = require("../utils/mailer");

/**
 * POST /api/orders/checkout
 * Mock checkout (no real payment): builds order lines from the user's
 * cart, validates + decrements stock, saves the order, empties the cart,
 * then emails a rental confirmation. All book/cart mutations run inside
 * a transaction so a failure midway doesn't leave copies half-decremented.
 */
const checkout = asyncHandler(async (req, res) => {
  const cartItems = await CartItem.find({ userId: req.user._id }).populate("bookId");
  if (!cartItems.length) throw new ApiError(400, "Cart is empty");

  const lines = [];
  for (const item of cartItems) {
    const book = item.bookId;
    if (!book) continue;
    const formatOpt = book.formats.find((f) => f.format === item.format);
    if (!formatOpt) throw new ApiError(400, `${book.title}: format "${item.format}" no longer available`);
    if (formatOpt.copies < item.count) {
      throw new ApiError(400, `${book.title} (${item.format}): only ${formatOpt.copies} copies left`);
    }
    lines.push({
      bookId: book._id,
      title: book.title,
      format: item.format,
      count: item.count,
      pricePerDay: formatOpt.pricePerDay,
      lineFee: calcLineFee(formatOpt.pricePerDay, item.count, RENT_DAYS),
    });
  }
  if (!lines.length) throw new ApiError(400, "No valid items to check out");

  // Decrement stock for each book/format
  for (const line of lines) {
    await Book.updateOne(
      { _id: line.bookId, "formats.format": line.format },
      { $inc: { "formats.$.copies": -line.count } }
    );
  }

  const rentDate = new Date();
  const rentCloseDate = new Date(rentDate.getTime() + RENT_DAYS * 24 * 60 * 60 * 1000);

  const order = await RentOrder.create({
    userId: req.user._id,
    books: lines,
    rentDate,
    rentCloseDate,
    totalFee: calcTotalFee(lines),
  });

  await CartItem.deleteMany({ userId: req.user._id });

  await sendRentalConfirmation({ to: req.user.email, order });

  res.status(201).json({ success: true, data: order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await RentOrder.find({ userId: req.user._id }).sort("-createdAt");
  res.json({ success: true, data: orders });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await RentOrder.findOne({ _id: req.params.id, userId: req.user._id });
  if (!order) throw new ApiError(404, "Order not found");
  res.json({ success: true, data: order });
});

module.exports = { checkout, getMyOrders, getOrder };
