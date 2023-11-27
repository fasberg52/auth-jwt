const express = require("express");
const chapterController = require("../../controllers/chapter");
const partController = require("../../controllers/part");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const ajvMiddlerware= require("../../middleware/ajvMiddlerware");
const { checkRole } = require("../../middleware/checkAccess");
const {upload} = require("../../utils/multerUtils");

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

router.get(
  "/chapter",
  jwtAuthMiddleware,
  chapterController.getAllChpters
);
router.get(
  "/chapter/:chapterId",
  jwtAuthMiddleware,
  chapterController.getChapterById
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
router.put(
  "/:courseId/chapter/:chapterId/part/:partId",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("icon"),
  partController.editPartWithChapterId
);
router.get("/parts", jwtAuthMiddleware, partController.gatAllPart);
router.get(
  "/chapters/:chapterId/parts",
  jwtAuthMiddleware,
  partController.getAllPartsWithChapterId
);

module.exports = router;
