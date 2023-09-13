//adminCourseController.js
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
  try {
    const { title, description, price, imageUrl, videoUrl } = req.body;
    const courseRepository = getManager().getRepository(Courses);
    const idCourse = req.params.id;

    const existingCourse = await courseRepository.findOne({
      where: { id: idCourse },
    });

    if (existingCourse) {
      existingCourse.title = title;
      existingCourse.description = description;
      existingCourse.price = price;
      existingCourse.imageUrl = imageUrl;
      existingCourse.videoUrl = videoUrl;

      // Save the updated course
      const editCourse = await courseRepository.save(existingCourse);

      res.json(editCourse);
    } else {
      // Move the 404 response here
      res.status(404).json({ error: "Course not found." });
    }
  } catch (error) {
    console.log(`Error editCourse: ${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while editing the course." });
  }
}

async function deleteCourse(req, res) {
  try {
    const courseRepository = getManager().getRepository(Courses);
    const idCourse = req.params.id;
    const existingCourse = await courseRepository.findOne({
      where: { id: idCourse },
    });
    if (existingCourse) {
      await courseRepository.remove(existingCourse);
      res.json({ message: "course deleted successfully." });
    } else {
      res.status(404).json({ error: "course not found." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while editing the deleteCourse." });
  }
}

module.exports = {
  addCourse,
  editCourse,
  deleteCourse,
};
