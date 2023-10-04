const Courses = require("../model/Course");
const { getManager } = require("typeorm");

async function getAllCourse(req, res) {
  try {
    const courseRepository = getManager().getRepository(Courses);
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const pageSize = parseInt(req.query.pageSize) || 10; // Default page size to 10 if not provided

    // Calculate the offset for pagination
    const offset = (page - 1) * pageSize;
    const allCourses = await courseRepository.find({
      skip: offset,
      take: pageSize,
    });
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
