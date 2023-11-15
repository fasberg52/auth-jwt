// utils/multerUtils.js

const multer = require("multer");
const path = require("path");
const fs = require("fs-extra"); // Import fs-extra

const createSubdirectory = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  return `${year}-${month}`;
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
        cb(err);
      });
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

module.exports = upload;
