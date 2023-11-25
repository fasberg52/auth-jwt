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
      return res.status(400).json({ error: "دسته بندی پیدا نشد" });
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
      discountStart: startMoment.toDate(),
      discountExpiration: expirationMoment.toDate(),
    });

    const saveCourse = await courseRepository.save(newCourse);
    console.log(`saveCourse >>> ${saveCourse}`);
    // Prepare a response object

    res
      .status(201)
      .json({ message: "دوره با موفقیت ایجاد شد", saveCourse, status: 200 });
  } catch (error) {
    console.error(`Error adding course: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
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

      res
        .status(200)
        .json({ message: "دوره بروز رسانی شد", editCourse, status: 200 });
    } else {
      // Move the 404 response here
      res.status(404).json({ error: "دوره ای پیدا نشد" });
    }
  } catch (error) {
    console.log(`Error editCourse: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
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
      res.status(200).json({ message: "دوره پاک شد" });
    } else {
      res.status(404).json({ error: "دوره ای پیدا نشد" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  addCourse,
  editCourse,
  deleteCourse,
};
