const Courses = require("../model/Course");
const { getManager } = require("typeorm");

async function getAllCourse(req, res) {
  try {
    const courseRepository = getManager().getRepository(Courses);
    const allCourses = await courseRepository.find();
    res.json(allCourses);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the getAllCourse." });
  }
}

async function getProductById(req, res) {
  try {
    const courseRepository = getManager().getRepository(Courses);
    const courseId = req.params.courseId;
    const existingCourse = await courseRepository.findOne({
      where: { id: courseId },
    });
    if (existingCourse) {
      res.json(existingCourse);
    } else {
      res.status(404).json({ error: "course not found." });
    }
  } catch (error) {
    console.log(`>>>>${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while creating the getProductById." });
  }
}

module.exports = {
  getAllCourse,
  getProductById,
};
