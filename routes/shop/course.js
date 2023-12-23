const courseController = require("../../controllers/course");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const { checkAccessEnroll } = require("../../middleware/checkAccessEnroll");
const { checkRole } = require("../../middleware/checkAccess");
const secureLink = require("../../controllers/secureLink");
const enrollmentController = require("../../controllers/enrollment");
const express = require("express");
const categoryController = require("../../controllers/category");
const router = express.Router();

router.get("/allcourses", jwtAuthMiddleware, courseController.getAllCourse);

router.post(
  "/my-courses",
  jwtAuthMiddleware,
  courseController.getCourseUserWithToken
);

router.get("/:courseId", jwtAuthMiddleware, courseController.getCourseById);

router.get("/category", categoryController.getAllCategories);

router.get("/play/:secureLink", secureLink.createSecureLink);
router.get(
  "/:courseId/part/:partId/access-enroll",
  jwtAuthMiddleware,
  enrollmentController.getVideoPathAfterEnrollWithPartId
);
router.get(
  "/:courseId/access-enroll",
  jwtAuthMiddleware,
  enrollmentController.getVideoPathAfterEnroll
);

module.exports = router;
