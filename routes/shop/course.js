const courseController = require("../../controllers/course");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const { checkRole } = require("../../middleware/checkAccess");

const express = require("express");
const categoryController = require("../../controllers/category");
const router = express.Router();


router.get("/allcourses", courseController.getAllCourse);
router.get("/category/:courseId", courseController.getProductById);
router.get("/category", categoryController.getAllCategories);

module.exports = router;
  