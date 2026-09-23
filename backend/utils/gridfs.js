const mongoose = require("mongoose");

function writeBufferToGridFS(buffer, { filename, bucketName = "covers", mimetype } = {}) {
  return new Promise((resolve, reject) => {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName });
    const uploadStream = bucket.openUploadStream(filename, { metadata: { mimetype } });
    uploadStream.end(buffer, (err) => {
      if (err) return reject(err);
      resolve(uploadStream.id);
    });
  });
}

module.exports = { writeBufferToGridFS };