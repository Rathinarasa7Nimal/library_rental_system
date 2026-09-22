const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

/**
 * Multer storage engine that streams the uploaded cover image straight
 * into MongoDB via GridFS (bucket name "covers"), per the requirement
 * that cover images must live in GridFS rather than an external URL.
 */
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return {
      bucketName: "covers",
      filename: `${Date.now()}-${file.originalname}`,
      metadata: { originalName: file.originalname, mimetype: file.mimetype },
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = upload;
