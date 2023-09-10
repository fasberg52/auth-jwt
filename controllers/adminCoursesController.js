const Courses = require("../model/Course");
const { getManager } = require("typeorm");

async function addCourse(req, res) {
  try {
    const { title, description, price, imageUrl, videoUrl } = req.body;

    const courseRepository = getManager().getRepository(Courses);
    const newCourse = courseRepository.create({
      title,
      description,
      price,
      imageUrl,
      videoUrl,
    });
    const saveCourse = await courseRepository.save(newCourse);
    res.json(saveCourse);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the Course." });
  }
}

async function editCourse(req, res) {
  const { title, description, price, imageUrl, videoUrl } = req.body;

  const courseRepository =  getManager().getRepository(Courses);

  

}

module.exports = {
  addCourse,
};
