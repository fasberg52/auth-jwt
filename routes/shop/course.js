const courseController = require("../../controllers/course");

const express = require("express");
const router = express.Router();

router.get("/allcourses", courseController.getAllCourse);
router.get("/onecourse/:courseId", courseController.getProductById);

module.exports = router;
