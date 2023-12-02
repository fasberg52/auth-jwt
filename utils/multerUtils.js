// utils/multerUtils.js

const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

const createSubdirectory = (date) => {
  const now = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const subdirectory = path.join(year.toString(), month);
  return subdirectory;
};

const generateUniqueFilename = (originalname, counter) => {
  const extension = path.extname(originalname);
  const baseName = path.basename(originalname, extension);
  return `${baseName}-${counter}${extension}`;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date()
    const subdirectory = createSubdirectory(now);
    req.uploadDir = path.join(__dirname, "../uploads", subdirectory);

    fs.ensureDir(req.uploadDir)
      .then(() => {
        cb(null, req.uploadDir);
      })
      .catch((err) => {
        cb(err);
      });
  },
  filename: async (req, file, cb) => {
    const originalname = file.originalname;

    let counter = req.fileCounter || 0;
    let filename;
    let baseName; // Declare baseName here to make it accessible in both branches
    let extension; // Declare extension here to make it accessible in the entire function

    if (counter === 0) {
      // For the first upload, use the original filename
      filename = originalname;
      baseName = path.basename(originalname, path.extname(originalname));
      extension = path.extname(originalname);
    } else {
      // For subsequent uploads, append the counter to the original filename
      extension = path.extname(originalname);
      baseName = path.basename(originalname, extension);
      filename = `${baseName}-${counter}${extension}`;
    }

    // Check if the filename already exists, increment counter if needed
    while (fs.existsSync(path.join(req.uploadDir, filename))) {
      counter++;
      filename = `${baseName}-${counter}${extension}`;
    }

    // Pass the updated counter to the next upload
    req.fileCounter = counter + 1;

    // Pass the uploadRepository to generateUniqueFilename
    req.uploadFilename = filename;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedFileTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/avi",
    ];
    if (file.size > 5 * 1024 * 1024) {
      return cb(null, false, {
        error: "File size limit exceeded. Maximum file size is 5 MB.",
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
