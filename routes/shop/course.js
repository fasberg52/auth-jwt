const courseController = require("../../controllers/course");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const { checkAccessEnroll } = require("../../middleware/checkAccessEnroll");
const { checkRole } = require("../../middleware/checkAccess");
const secureLink = require("../../controllers/secureLink");
const enrollmentController = require("../../controllers/enrollment");
const express = require("express");
const categoryController = require("../../controllers/category");
const router = express.Router();

router.get("/allcourses", courseController.getAllCourse);
router.get("/:courseId", courseController.getCourseById);
router.get("/category", categoryController.getAllCategories);

router.get("/play/:secureLink", secureLink.createSecureLink);
router.get(
  "/enroll",
  checkAccessEnroll,
  enrollmentController.getAllChapterAndPartAfterEnroll
);
module.exports = router;
