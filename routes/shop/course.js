const courseController = require("../../controllers/course");

const express = require("express");
const router = express.Router();

router.get("/allcourses", courseController.getAllCourse);

module.exports = router;
