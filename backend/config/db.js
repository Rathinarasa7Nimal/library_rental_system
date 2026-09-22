const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers(["8.8.8.8","1.1.1.1"])

/**
 * Connects to MongoDB. Returns the native connection, which GridFS
 * (book cover image storage) needs once the connection is open.
 */
async function connectDB() {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn.connection;
}

module.exports = connectDB;
