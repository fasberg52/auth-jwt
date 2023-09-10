const Courses = require("../model/Course");
const { getManager } = require("typeorm");


async function getAllCourse(req, res) {
  try {
    const courseRepository = getManager().getRepository(Courses);
    const allCourses = await courseRepository.find();
    res.json(allCourses);
  } catch (error) {
    console.log(`>>> Error getAllCourse : ${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while creating the getAllCourse." });
  }
}

module.exports = {
  getAllCourse,
};
