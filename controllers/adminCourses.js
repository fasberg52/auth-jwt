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
      bannerUrl,
      discountPrice,
      discountStart,
      discountExpiration,
    } = req.body;

    // const imageUrl = req.file ? "/uploads/" + req.file.filename : null;

    let category = null;
    if (categoryId !== undefined && categoryId !== null) {
      category = await getManager()
        .getRepository(Category)
        .findOne({ where: { id: categoryId } });
    }
    const startMoment = jalaliMoment(discountStart, "jYYYY-jM-jD");
    const expirationMoment = jalaliMoment(discountExpiration, "jYYYY-jM-jD");

    const courseRepository = getManager().getRepository(Courses);
    const newCourse = courseRepository.create({
      title,
      description,
      price,
      imageUrl,
      bannerUrl,
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
      .json({ message: "دوره با موفقیت ایجاد شد", saveCourse, status: 201 });
  } catch (error) {
    console.error(`Error adding course: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function editCourse(req, res) {
  try {
    const {
      title,
      description,
      price,
      videoUrl,
      categoryId,
      imageUrl,
      bannerUrl,
      discountPrice,
      discountStart,
      discountExpiration,
    } = req.body;
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
      existingCourse.bannerUrl = bannerUrl;
      existingCourse.videoUrl = videoUrl;
      existingCourse.discountPrice = discountPrice;
      existingCourse.discountStart = discountStart;
      existingCourse.discountExpiration = discountExpiration;

      const startMoment = jalaliMoment(discountStart, "jYYYY-jMMMM-jD");
      const expirationMoment = jalaliMoment(discountExpiration, "jYYYY-jMMMM-jD");

      existingCourse.discountStart = startMoment.toDate();
      existingCourse.discountExpiration = expirationMoment.toDate();

      if (categoryId !== undefined && categoryId !== null) {
        const category = await getManager()
          .getRepository(Category)
          .findOne({ where: { id: categoryId } });

        existingCourse.category = category;
      }

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
