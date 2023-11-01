const express = require("express");
const chapterController = require("../../controllers/chapter");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const { checkRole } = require("../../middleware/checkAccess");
const upload = require("../../utils/multerUtils");

const router = express.Router();

router.post(
  "/course/create-chapter",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("icon"),
  chapterController.createChapter
);

router.put(
  "/course/update-chapter/:id",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("icon"),
  chapterController.editChapter
);

module.exports = router;
