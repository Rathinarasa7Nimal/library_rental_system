require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Book = require("../models/Book");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

/**
 * Demo catalog: novels, biographies, textbooks, comics, self-help - at
 * least 20 books, spanning every category and format the app supports.
 * Each book's `formats` array is reused (max reusability) via `fmt()`.
 */
const fmt = (format, pricePerDay, copies) => ({ format, pricePerDay, copies });

const books = [
  { title: "The Silent Orchard", author: "Maya Lindqvist", category: "Fiction", description: "A literary novel about three sisters reuniting after their father's death.", formats: [fmt("Paperback", 15, 6), fmt("E-Book", 8, 50)] },
  { title: "Embers of Tomorrow", author: "Rashid Al-Amin", category: "Fiction", description: "A post-apocalyptic tale of a city rebuilding after a great flood.", formats: [fmt("Hardcover", 25, 3), fmt("Paperback", 15, 8)] },
  { title: "The Cartographer's Daughter", author: "Elena Voss", category: "Fiction", description: "Historical fiction following a mapmaker's daughter in 17th-century Amsterdam.", formats: [fmt("Paperback", 15, 5), fmt("E-Book", 8, 40)] },
  { title: "Midnight in Colombo", author: "Nadeeka Perera", category: "Fiction", description: "A mystery-thriller set across the streets of Colombo during monsoon season.", formats: [fmt("Paperback", 15, 7), fmt("E-Book", 8, 60)] },
  { title: "Where the Rivers Meet", author: "Grace Okoye", category: "Fiction", description: "A coming-of-age story of a girl growing up along the Niger river.", formats: [fmt("Hardcover", 25, 2), fmt("Paperback", 15, 6)] },
  { title: "Steve Jobs: The Exclusive Biography", author: "Walter Isaacson", category: "Non-Fiction", description: "An in-depth biography of the Apple co-founder based on exclusive interviews.", formats: [fmt("Hardcover", 25, 4), fmt("Paperback", 15, 10), fmt("E-Book", 8, 70)] },
  { title: "Becoming", author: "Michelle Obama", category: "Non-Fiction", description: "A memoir by the former First Lady of the United States.", formats: [fmt("Hardcover", 25, 3), fmt("Paperback", 15, 9)] },
  { title: "Educated: A Memoir", author: "Tara Westover", category: "Non-Fiction", description: "A memoir about a woman who leaves her survivalist family to pursue education.", formats: [fmt("Paperback", 15, 8), fmt("E-Book", 8, 55)] },
  { title: "Leonardo da Vinci", author: "Walter Isaacson", category: "Non-Fiction", description: "A biography exploring the life and genius of Leonardo da Vinci.", formats: [fmt("Hardcover", 25, 2), fmt("Paperback", 15, 5)] },
  { title: "The Wright Brothers", author: "David McCullough", category: "Non-Fiction", description: "The story of Wilbur and Orville Wright and the invention of flight.", formats: [fmt("Paperback", 15, 6), fmt("E-Book", 8, 30)] },
  { title: "Introduction to Algorithms", author: "Cormen, Leiserson, Rivest, Stein", category: "Academic", description: "The definitive textbook on algorithms and data structures (CLRS).", formats: [fmt("Hardcover", 30, 5), fmt("E-Book", 12, 40)] },
  { title: "Database System Concepts", author: "Silberschatz, Korth, Sudarshan", category: "Academic", description: "A comprehensive textbook covering relational and modern database systems.", formats: [fmt("Hardcover", 30, 4), fmt("Paperback", 20, 6)] },
  { title: "Computer Networking: A Top-Down Approach", author: "Kurose & Ross", category: "Academic", description: "A widely used undergraduate textbook on computer networks.", formats: [fmt("Hardcover", 30, 3), fmt("E-Book", 12, 35)] },
  { title: "Operating System Concepts", author: "Silberschatz, Galvin, Gagne", category: "Academic", description: "Core textbook covering process management, memory, and file systems.", formats: [fmt("Hardcover", 30, 4), fmt("Paperback", 20, 5)] },
  { title: "Linear Algebra and Its Applications", author: "David C. Lay", category: "Academic", description: "Undergraduate textbook on linear algebra theory and applications.", formats: [fmt("Hardcover", 28, 3), fmt("E-Book", 12, 25)] },
  { title: "Software Engineering: A Practitioner's Approach", author: "Roger Pressman", category: "Academic", description: "Textbook covering the software development lifecycle and methodologies.", formats: [fmt("Paperback", 22, 6), fmt("E-Book", 12, 30)] },
  { title: "Saga, Vol. 1", author: "Brian K. Vaughan", category: "Comics", description: "An epic space-opera graphic novel about star-crossed lovers from warring planets.", formats: [fmt("Paperback", 12, 10), fmt("E-Book", 6, 40)] },
  { title: "Watchmen", author: "Alan Moore", category: "Comics", description: "A groundbreaking graphic novel deconstructing the superhero genre.", formats: [fmt("Hardcover", 20, 3), fmt("Paperback", 12, 8)] },
  { title: "Maus", author: "Art Spiegelman", category: "Comics", description: "A Pulitzer Prize-winning graphic memoir about the Holocaust.", formats: [fmt("Paperback", 12, 6), fmt("E-Book", 6, 25)] },
  { title: "One Piece, Vol. 1", author: "Eiichiro Oda", category: "Comics", description: "The first volume of the beloved pirate adventure manga series.", formats: [fmt("Paperback", 10, 12), fmt("E-Book", 5, 60)] },
  { title: "Spider-Man: Blue", author: "Jeph Loeb & Tim Sale", category: "Comics", description: "A nostalgic retelling of Spider-Man and Gwen Stacy's early romance.", formats: [fmt("Paperback", 12, 5), fmt("E-Book", 6, 20)] },
  { title: "Atomic Habits", author: "James Clear", category: "Non-Fiction", description: "A practical guide to building good habits and breaking bad ones.", formats: [fmt("Paperback", 16, 12), fmt("E-Book", 8, 80)] },
  { title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", category: "Non-Fiction", description: "A self-help classic on personal and professional effectiveness.", formats: [fmt("Paperback", 16, 9), fmt("E-Book", 8, 45)] },
  { title: "Think Again", author: "Adam Grant", category: "Non-Fiction", description: "A book on the power of knowing what you don't know.", formats: [fmt("Paperback", 16, 7), fmt("E-Book", 8, 35)] },
];

async function seed() {
  await connectDB();

  const count = await Book.countDocuments();
  if (count > 0) {
    console.log(`Books collection already has ${count} documents - skipping insert.`);
  } else {
    await Book.insertMany(books);
    console.log(`Inserted ${books.length} demo books.`);
  }

  // Convenience: create one admin account for managing the catalog
  const adminEmail = "admin@library.local";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash("Admin@123", 12);
    await User.create({ name: "Admin", email: adminEmail, password: hashed, role: "admin" });
    console.log(`Created admin user: ${adminEmail} / Admin@123`);
  }

  await mongoose.disconnect();
  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
