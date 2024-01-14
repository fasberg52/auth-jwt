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
console.log("here upaod");
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
    let baseName; 
    let extension;

    if (counter === 0) {
      filename = originalname;
      baseName = path.basename(originalname, path.extname(originalname));
      extension = path.extname(originalname);
    } else {
      extension = path.extname(originalname);
      baseName = path.basename(originalname, extension);
      filename = `${baseName}-${counter}${extension}`;
    }

    while (fs.existsSync(path.join(req.uploadDir, filename))) {
      counter++;
      filename = `${baseName}-${counter}${extension}`;
    }

    req.fileCounter = counter + 1;

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
    // const allowedFileTypes = [
    //   "image/jpeg",
    //   "image/png",
    //   "image/webp",
    //   "video/mp4",
    //   "video/avi",
    //   "video/m4v"
    // ];
    if (file.size > 5 * 1024 * 1024) {
      cb(null, false, {
        error: "File size limit exceeded. Maximum file size is 5 MB.",
      });
    } else {
      // Uncomment the following block if you have specific file type restrictions
      // if (allowedFileTypes.includes(file.mimetype)) {
      //   cb(null, true);
      // } else {
      //   cb(null, false, {
      //     error:
      //       "Invalid file type. Only JPG, PNG, WEBP, MP4, and AVI files are allowed.",
      //   });
      // }

      // In the absence of file type restrictions, call cb with true for successful uploads
      cb(null, true);
    }
  },
});

module.exports = { upload, createSubdirectory };
