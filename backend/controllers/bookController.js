const mongoose = require("mongoose");
const Book = require("../models/Book");
const createCrudController = require("../utils/controllerFactory");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// Reusable CRUD base: getAll handles search + filters + pagination already.
// allowedFilters: category, format (format needs a bit of custom handling
// below since it lives inside the `formats` array, not a top-level field).
const base = createCrudController(Book, {
  allowedFilters: ["category"],
  searchFields: true,
  defaultLimit: 10,
  maxLimit: 50,
});

/**
 * GET /api/books
 * Wraps the reusable base.getAll but adds book-specific filters that the
 * generic factory can't express: `format` (inside a subdocument array) and
 * `availability` (available = at least one format with copies > 0).
 * Filters combine (search + category + format + availability together).
 */
const getBooks = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

  const filter = base.buildFilter(req.query);

  if (req.query.format && req.query.format !== "all") {
    filter["formats.format"] = req.query.format;
  }
  if (req.query.availability === "available") {
    filter["formats"] = {
      $elemMatch: {
        copies: { $gt: 0 },
        ...(req.query.format && req.query.format !== "all" ? { format: req.query.format } : {}),
      },
    };
  }

  const [items, total] = await Promise.all([
    Book.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(req.query.sort || "-createdAt"),
    Book.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  });
});

/**
 * POST /api/books  (admin only)
 * Accepts multipart/form-data. `formats` arrives as a JSON string
 * (e.g. '[{"format":"Paperback","pricePerDay":20,"copies":5}]') since
 * multipart fields are strings; parse it before saving.
 */
const createBook = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (typeof body.formats === "string") {
    body.formats = JSON.parse(body.formats);
  }
  if (req.file && req.file.id) {
    body.coverImageId = req.file.id;
  }
  const book = await Book.create(body);
  res.status(201).json({ success: true, data: book });
});

const updateBook = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (typeof body.formats === "string") {
    body.formats = JSON.parse(body.formats);
  }
  if (req.file && req.file.id) {
    body.coverImageId = req.file.id;
  }
  const book = await Book.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!book) throw new ApiError(404, "Book not found");
  res.json({ success: true, data: book });
});

/**
 * GET /api/books/:id/cover
 * Streams the cover image straight out of GridFS. `?w=` optionally caps
 * width for a lightweight "optimize for viewing" thumbnail vs full image,
 * without ever writing a resized copy back to disk.
 */
const getCover = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id).select("coverImageId");
  if (!book || !book.coverImageId) throw new ApiError(404, "Cover image not found");

  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "covers",
  });

  const files = await bucket.find({ _id: book.coverImageId }).toArray();
  if (!files.length) throw new ApiError(404, "Cover image not found");
  const file = files[0];

  res.set("Content-Type", file.metadata?.mimetype || "image/jpeg");
  res.set("Cache-Control", "public, max-age=86400"); // browser-cache the cover for a day

  const width = parseInt(req.query.w, 10);
  const downloadStream = bucket.openDownloadStream(book.coverImageId);

  if (width && Number.isFinite(width)) {
    // Lazy-require sharp only when resizing is actually requested.
    const sharp = require("sharp");
    downloadStream.pipe(sharp().resize({ width }).on("error", () => {})).pipe(res);
  } else {
    downloadStream.pipe(res);
  }
});

module.exports = {
  ...base,
  getAll: getBooks,
  create: createBook,
  update: updateBook,
  getCover,
};
