const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const CartItem = require("../models/Cart");
const Book = require("../models/Book");

// Same-syntax helper reused by every cart action below, so add/update/remove
// all resolve the "who owns this cart" filter identically.
const ownerFilter = (req) => (req.user ? { userId: req.user._id } : { guestId: req.guestId });

const getCart = asyncHandler(async (req, res) => {
  const items = await CartItem.find(ownerFilter(req)).populate("bookId");
  res.json({ success: true, data: items });
});

const addToCart = asyncHandler(async (req, res) => {
  const { bookId, format, count = 1 } = req.body;
  if (!bookId || !format) throw new ApiError(400, "bookId and format are required");

  const book = await Book.findById(bookId);
  if (!book) throw new ApiError(404, "Book not found");
  if (!book.formats.some((f) => f.format === format)) {
    throw new ApiError(400, `Format "${format}" is not available for this book`);
  }

  const filter = { ...ownerFilter(req), bookId, format };
  let item = await CartItem.findOne(filter);
  if (item) {
    item.count += Number(count);
    await item.save();
  } else {
    item = await CartItem.create({ ...filter, count });
  }
  res.status(201).json({ success: true, data: item });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { count } = req.body;
  if (!count || count < 1) throw new ApiError(400, "count must be at least 1");

  const item = await CartItem.findOneAndUpdate(
    { _id: req.params.id, ...ownerFilter(req) },
    { count },
    { new: true }
  );
  if (!item) throw new ApiError(404, "Cart item not found");
  res.json({ success: true, data: item });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const item = await CartItem.findOneAndDelete({ _id: req.params.id, ...ownerFilter(req) });
  if (!item) throw new ApiError(404, "Cart item not found");
  res.json({ success: true, data: {} });
});

/**
 * Called right after login so a guest cart (identified by x-guest-id)
 * merges into the now-known user's cart instead of being lost.
 */
const mergeGuestCart = asyncHandler(async (req, res) => {
  const { guestId } = req.body;
  if (!guestId) throw new ApiError(400, "guestId is required");

  const guestItems = await CartItem.find({ guestId });
  for (const gi of guestItems) {
    const existing = await CartItem.findOne({ userId: req.user._id, bookId: gi.bookId, format: gi.format });
    if (existing) {
      existing.count += gi.count;
      await existing.save();
      await gi.deleteOne();
    } else {
      gi.userId = req.user._id;
      gi.guestId = null;
      await gi.save();
    }
  }
  const items = await CartItem.find({ userId: req.user._id }).populate("bookId");
  res.json({ success: true, data: items });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, mergeGuestCart };
