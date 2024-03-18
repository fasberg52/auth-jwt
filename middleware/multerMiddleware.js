const multer = require("multer");

function handleMulterErrors(err, req, res, next) {
  
  if (req.fileValidationError) {
    return res.status(400).json({ error: req.fileValidationError.message });
  }
  if (req.file instanceof multer.MulterError) {
    return res.status(500).json({ error: `Multer error: ${req.file.message}` });
  }

  // Check for general errors
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      // Multer error: File size exceeded
      return res.status(400).json({
        error: "حجم فایل بیشتر از 5 مگابایت است", // Customize the error message here
      });
    } else {
      // Other Multer errors
      return res.status(400).json({
        error: "Multer error: " + err.message,
      });
    }
  } else if (err) {
    // Other unexpected errors
    console.error("Unexpected error during file upload:", err);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }

  // No errors, proceed to the next middleware or route handler
  next();
}


module.exports = { handleMulterErrors };
