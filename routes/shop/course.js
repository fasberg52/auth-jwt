const courseController = require("../../controllers/course");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const { checkRole } = require("../../middleware/checkAccess");

const express = require("express");
const categoryController = require("../../controllers/category");
const router = express.Router();


router.get("/allcourses", courseController.getAllCourse);
router.get("/:courseId", courseController.getProductById);
router.get("/all-category", categoryController.getAllCategories);

module.exports = router;
