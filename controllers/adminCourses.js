//adminCourseController.js
const Courses = require("../model/Course");
const Category = require("../model/Category");
const { getManager } = require("typeorm");
const logger = require("../services/logger");
async function addCourse(req, res) {
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

    if (discountPrice && discountPrice >= price) {
      return res
        .status(400)
        .json({ error: "تخفیف نمیتواند از قیمت اصلی بیشتر باشد" });
    }
    if (discountExpiration && discountExpiration < discountStart) {
      return res
        .status(400)
        .json({ error: "تخفیف پایانی نباید کمتر از ابتدایی باشد" });
    }

    let category = null;
    if (categoryId !== undefined && categoryId !== null) {
      category = await getManager()
        .getRepository(Category)
        .findOne({ where: { id: categoryId } });
    }

    const startMoment = discountStart;
    const expirationMoment = discountExpiration;
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
      discountStart: startMoment ? startMoment.toDate() : null,
      discountExpiration: expirationMoment ? expirationMoment.toDate() : null,
    });

    const result = await courseRepository.save(newCourse);
    console.log(`result >>> ${result}`);

    return res
      .status(201)
      .json({ message: "دوره با موفقیت ایجاد شد", result, status: 201 });
  } catch (error) {
    console.error(`Error adding course: ${error}`);
    return res.status(500).json({ error: "Internal Server Error" });
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

      // Check if discountStart and discountExpiration are provided
      const startMoment = discountStart;
      const expirationMoment = discountExpiration;
      existingCourse.discountStart = startMoment ? startMoment.toDate() : null;
      existingCourse.discountExpiration = expirationMoment
        ? expirationMoment.toDate()
        : null;

      if (categoryId !== undefined && categoryId !== null) {
        const category = await getManager()
          .getRepository(Category)
          .findOne({ where: { id: categoryId } });

        existingCourse.category = category;
      }

      // Save the updated course
      existingCourse.lastModified = new Date();
      const result = await courseRepository.save(existingCourse);

      res
        .status(200)
        .json({ message: "دوره بروز رسانی شد", result, status: 200 });
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

async function getAdminCourseById(req, res) {
  try {
    const courseRepository = getManager().getRepository(Courses);
    const courseId = req.params.courseId;

    // Fetch the course with related chapters, parts, and category
    const existingCourse = await courseRepository
      .createQueryBuilder("course")
      .leftJoin("course.category", "category")
      .leftJoin("course.chapters", "chapter")
      .leftJoin("chapter.parts", "part")
      .select([
        "course.id",
        "course.title",
        "course.description",
        "course.price",
        "course.discountPrice",
        "course.discountStart",
        "course.discountExpiration",
        "course.imageUrl",
        "course.bannerUrl",
        "course.videoUrl",
        "course.createdAt",
        "course.lastModified",
      ])
      .addSelect(["category.id", "category.name"])
      .addSelect(["chapter.id", "chapter.title", "chapter.orderIndex"])
      .addSelect([
        "part.id",
        "part.title",
        "part.description",
        "part.videoDuration",
        "part.isFree",
        "part.videoPath",
        "part.orderIndex",
      ])
      .where("course.id = :courseId", { courseId })
      .orderBy("chapter.orderIndex", "ASC")
      .addOrderBy("part.orderIndex", "ASC")

      .getOne();

    if (existingCourse) {
      logger.info(`getCourseById successful for courseId ${courseId}`);

      res.json(existingCourse);
    } else {
      logger.info(`getCourseById failed for courseId ${courseId}`);
      res.status(404).json({ error: "Course not found." });
    }
  } catch (error) {
    logger.error(`Error in getAdminCourseById  ${error}`);

    console.log(`>>>>${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the course." });
  }
}

module.exports = {
  addCourse,
  editCourse,
  deleteCourse,
  getAdminCourseById,
};
