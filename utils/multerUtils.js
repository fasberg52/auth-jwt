// utils/multerUtils.js

const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

let uploadCounter = {}; // Maintain a counter object to track each file

const createSubdirectory = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const subdirectory = path.join(year.toString(), month);
  return subdirectory;
};

const generateUniqueFilename = (originalname) => {
  const baseName = path.basename(originalname, path.extname(originalname));
  const extension = path.extname(originalname);

  if (!uploadCounter[originalname]) {
    // First upload of this file
    uploadCounter[originalname] = 1;
    return `${baseName}${extension}`;
  } else {
    // Subsequent uploads, increment the counter
    const count = uploadCounter[originalname]++;
    return `${baseName}-${count}${extension}`;
  }
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
    const originalname = file.originalname;
    const filename = generateUniqueFilename(originalname);
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

