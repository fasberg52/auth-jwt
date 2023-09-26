const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads")); // Save uploads in an "uploads" directory
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, Date.now() + extension); // Rename the uploaded file with a timestamp
  },
});

const upload = multer({ storage });

module.exports = upload;
