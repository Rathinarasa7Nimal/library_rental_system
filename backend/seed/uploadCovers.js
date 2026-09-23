require("dotenv").config();
const connectDB = require("../config/db");
const mongoose = require("mongoose");
const Book = require("../models/Book");
const { generatePlaceholderCover } = require("../utils/placeholderCover");

/**
 * Sends each cover as a REAL multipart/form-data HTTP request to the
 * running server's `PUT /api/books/:id` route - the same request a human
 * admin would send from a form. Passes through Multer and
 * multer-gridfs-storage exactly as required.
 *
 * Requires the backend server to already be running (`npm run dev`).
 */
const BASE_URL = `http://localhost:${process.env.PORT || 5000}/api`;
const ADMIN_EMAIL = "admin@library.local";
const ADMIN_PASSWORD = "Admin@123"; // matches the account seedBooks.js creates

async function getAdminToken() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Admin login failed: ${data.message}`);
  return data.token;
}

async function uploadCover(token, book) {
  const buffer = await generatePlaceholderCover(book);
  const form = new FormData();
  form.append("cover", new Blob([buffer], { type: "image/png" }), `${book._id}.png`);

  const res = await fetch(`${BASE_URL}/books/${book._id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: form, // fetch sets the multipart boundary header automatically
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Upload failed for "${book.title}": ${data.message}`);
  return data.data;
}

async function run() {
  await connectDB();

  const token = await getAdminToken();
  const books = await Book.find({ coverImageId: null });

  if (!books.length) {
    console.log("Every book already has a cover image - nothing to do.");
  } else {
    console.log(`Uploading covers for ${books.length} book(s) through Multer -> GridFS...`);
    for (const book of books) {
      await uploadCover(token, book);
      console.log(`  done: ${book.title}`);
    }
  }

  await mongoose.disconnect();
  console.log("All covers uploaded via the real Multer/GridFS route.");
}

run().catch((err) => {
  console.error(err.message);
  if (err.cause) console.error("Cause:", err.cause);
  process.exit(1);
});