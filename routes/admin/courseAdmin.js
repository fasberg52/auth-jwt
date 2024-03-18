const express = require("express");
const chapterController = require("../../controllers/chapter");
const partController = require("../../controllers/part");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const ajvMiddlerware = require("../../middleware/ajvMiddlerware");
const { checkRole } = require("../../middleware/checkAccess");
const { upload } = require("../../utils/multerUtils");
const router = express.Router();

router.post(
  "/chapter",
  jwtAuthMiddleware,
  checkRole("admin"),

  upload.single("icon"),
  chapterController.createChapter
);

router.put(
  "/chapter/:id",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("icon"),
  chapterController.editChapter
);
router.delete(
  "/chapter/:id",
  jwtAuthMiddleware,
  checkRole("admin"),
  chapterController.deleteChapter
);

router.get(
  "/:courseId/chapter",
  jwtAuthMiddleware,
  chapterController.getAllChpters
);
router.get(
  "/chapter/:chapterId",
  jwtAuthMiddleware,
  chapterController.getChapterById
);
router.get(
  "/:courseId/chapters",
  jwtAuthMiddleware,
  chapterController.getAllChpaterWithParts
);

router.post(
  "/part",
  jwtAuthMiddleware,
  checkRole("admin"),
  ajvMiddlerware.validParts,
  upload.single("icon"),
  partController.createPart
);
router.put(
  "/part/:id",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("icon"),
  partController.editPart
);

router.delete("/part/:id", partController.deletePart);
router.put(
  "/:courseId/chapter/:chapterId/part/:partId",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("icon"),
  partController.editPartWithChapterId
);
router.get(
  "/:courseId/part",
  jwtAuthMiddleware,
  partController.gatAllPartwithCourseId
);
router.get(
  "/:courseId/chapters/:chapterId/part",
  jwtAuthMiddleware,
  partController.getAllPartsWithChapterId
);

router.get(
  "/:courseId/course-content",
  jwtAuthMiddleware,
  partController.getAllChaptersAndParts
);

router.get("/part/:partId/video-path", partController.getVideoPathWithPartId);

module.exports = router;
