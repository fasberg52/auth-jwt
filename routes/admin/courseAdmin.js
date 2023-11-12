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

router.get(
  "/course/all-chapter",
  jwtAuthMiddleware,
  chapterController.getAllChpters
);
router.get(
  "/course/chapter-id",
  jwtAuthMiddleware,
  chapterController.getChapterById
);

router.post(
  "/course/create-part",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("icon"),
  partController.createPart
);
router.put(
  "/course/edit-part",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("icon"),
  partController.editPart
);
router.put(
  "/course/:courseId/chapter/:chapterId/part/:partId",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("icon"),
  partController.editPartWithChapterId
);
router.get("/course/all-parts", jwtAuthMiddleware, partController.gatAllPart);
router.get(
  "/course/chapters/:chapterId/parts",
  jwtAuthMiddleware,
  partController.getAllPartsWithChapterId
);

module.exports = router;
