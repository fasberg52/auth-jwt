const courseController = require("../../controllers/course");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const { checkRole } = require("../../middleware/checkAccess");
const secureLink = require("../../controllers/secureLink");
const express = require("express");
const categoryController = require("../../controllers/category");
const router = express.Router();

router.get("/allcourses", courseController.getAllCourse);
router.get("/:courseId", courseController.getCourseById);
router.get("/category", categoryController.getAllCategories);

router.get("/play/:token", secureLink.createSecureLink);

module.exports = router;
