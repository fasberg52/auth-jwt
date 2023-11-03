const express = require("express");
const chapterController = require("../../controllers/chapter");
const partController = require("../../controllers/part");
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

router.post(
  "/course/create-part",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("icon"),
  partController.createPart
);

module.exports = router;
