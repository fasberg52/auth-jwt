// utils/multerUtils.js

const multer = require('multer');
const path = require("path");
const fs = require("fs-extra"); // Import fs-extra

const createSubdirectory = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  const subdirectory = path.join(year.toString(), month);
  return subdirectory; // Only return the subdirectory string
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subdirectory = createSubdirectory();
    const uploadDir = path.join(__dirname, "../uploads", subdirectory);

    fs.ensureDir(uploadDir)
      .then(() => {
        cb(null, uploadDir);
      })
      .catch((err) => {
        // Check for file size limit error
        cb(err);
      });
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
// Configuration for multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/avi",
    ];
    if (file.size > 1 * 1024 * 1024) {
      return cb(null, false, {
        error: "File size limit exceeded. Maximum file size is 1 MB.",
      });
    }
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false, {
        error:
          "Invalid file type. Only JPG, PNG, WEBP, MP4, and AVI files are allowed.",
      });
    }
  },
});

module.exports = { upload, createSubdirectory };
