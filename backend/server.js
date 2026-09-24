require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Serverless functions (Vercel) are stateless between invocations, so we
// cache the connection promise instead of reconnecting on every request -
// a warm invocation reuses the already-open connection; a cold one awaits
// it once before handling the request.
let dbConnectionPromise = null;
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      dbConnectionPromise = dbConnectionPromise || connectDB();
      await dbConnectionPromise;
    }
    next();
  } catch (err) {
    next(err);
  }
});

app.get("/api/health", (req, res) => res.json({ success: true, status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use(errorHandler);

// Vercel's Node runtime requires the file to export a request handler -
// an Express app works directly as one.
module.exports = app;

// Only start a normal listening server for local dev / traditional
// hosting (e.g. `node server.js`) - NOT when Vercel imports this file,
// since Vercel calls the exported app per-request instead.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB:", err.message);
      process.exit(1);
    });
}