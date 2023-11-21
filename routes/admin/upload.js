const express = require("express");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const ajvMiddlerware = require("../../middleware/ajvMiddlerware");
const { checkRole } = require("../../middleware/checkAccess");
const { upload } = require("../../utils/multerUtils");
const {
  createUpload,
  getAllUploads,
  getUploadById,
  updateUpload,
  deleteUpload,
  getUploadByPath,
} = require("../../controllers/upload");
const router = express.Router();

router.post(
  "/upload",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("path"),
  createUpload
);

router.get("/upload", jwtAuthMiddleware, checkRole("admin"), getAllUploads);

router.get(
  "/upload/:id",
  //jwtAuthMiddleware,
  // checkRole("admin"),
  getUploadById
);
router.get(
  "/upload/path/:path",
  //jwtAuthMiddleware,
  // checkRole("admin"),
  getUploadByPath
);

router.put("/upload", jwtAuthMiddleware, checkRole("admin"), updateUpload);

router.delete(
  "/upload/:id",
  jwtAuthMiddleware,
  checkRole("admin"),
  deleteUpload
);

module.exports = router;
