const multer = require("multer");

/**
 * Parses the uploaded file into memory (req.file.buffer) only - it does
 * NOT write to GridFS itself. The actual GridFS write happens in the
 * controller via utils/gridfs.js.
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;