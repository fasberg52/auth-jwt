//adminCourseController.js
const Courses = require("../model/Course");
const Category = require("../model/Category");
const { getManager } = require("typeorm");
const upload = require("../utils/multerUtils");
const jalaliMoment = require("jalali-moment");
async function addCourse(req, res) {
  try {
    console.log("Request Body:", req.body);
    const {
      title,
      description,
      price,
      videoUrl,
      categoryId,
      imageUrl,
      discountPrice,
      discountStart,
      discountExpiration,
    } = req.body;

    // const imageUrl = req.file ? "/uploads/" + req.file.filename : null;
    const category = await getManager()
      .getRepository(Category)
      .findOne({ where: { id: categoryId } });
    if (!category) {
      return res.status(400).json({ error: "Category not found" });
    }

    // Use jalaliMoment to parse the Jalali date strings
    const startMoment = jalaliMoment(discountStart, "jYYYY-jM-jD");
    const expirationMoment = jalaliMoment(discountExpiration, "jYYYY-jM-jD");

    // Corrected entity name from Courses to Course
    const courseRepository = getManager().getRepository(Courses);
    const newCourse = courseRepository.create({
      title,
      description,
      price,
      imageUrl,
      videoUrl,
      category,
      discountPrice,
      discountStart: startMoment.toDate(), // Convert Jalali to JavaScript Date
      discountExpiration: expirationMoment.toDate(), // Convert Jalali to JavaScript Date
    });

    const saveCourse = await courseRepository.save(newCourse);
    console.log(`saveCourse >>> ${saveCourse}`);
    // Prepare a response object

    res.status(201).json({ saveCourse, status: 200 });
  } catch (error) {
    console.error(`Error adding course: ${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while creating the Course." });
  }
}

async function editCourse(req, res) {
  try {
    const { title, description, price, videoUrl } = req.body;
    const courseRepository = getManager().getRepository(Courses);
    const idCourse = req.params.id;

    const existingCourse = await courseRepository.findOne({
      where: { id: idCourse },
    });

    //  // Handle image upload
    //  if (req.file) {
    //   // Delete the previous image if it exists
    //   if (existingCourse.imageUrl) {
    //     fs.unlinkSync(existingCourse.imageUrl);
    //   }

    //   // Set the new image URL
    //   existingCourse.imageUrl = "/uploads/" + req.file.filename;
    // }

    if (existingCourse) {
      existingCourse.title = title;
      existingCourse.description = description;
      existingCourse.price = price;

      existingCourse.videoUrl = videoUrl;

      // Save the updated course
      existingCourse.lastModified = new Date();
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
