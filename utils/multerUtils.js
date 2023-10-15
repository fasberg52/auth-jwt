const multer = require("multer");
const path = require("path");
const fs = require("fs-extra"); // Import fs-extra

// Define the createSubdirectory function
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

    // Create the subdirectory if it doesn't exist
    fs.ensureDir(uploadDir)
      .then(() => {
        cb(null, uploadDir);
      })
      .catch((err) => {
        cb(err);
      });
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, Date.now() + extension);
  },
});

const upload = multer({ storage });

module.exports = upload;
