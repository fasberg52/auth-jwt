const express = require("express");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const ajvMiddlerware = require("../../middleware/ajvMiddlerware");
const { checkRole } = require("../../middleware/checkAccess");
const upload = require("../../utils/multerUtils");
const {
  createUpload,
  getAllUploads,
  getUploadById,
  updateUpload,
  deleteUpload,
} = require("../../controllers/upload");
const router = express.Router();

router.post(
  "/upload",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("path"),
  createUpload
);

router.get("/upload", getAllUploads);

router.get("/upload", getUploadById);

router.put("upload", updateUpload);

router.delete("upload", deleteUpload);

module.exports = router;
