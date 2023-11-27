const Courses = require("../model/Course");
const { getManager } = require("typeorm");
const { convertToJalaliDate } = require("../services/jalaliService");

async function getAllCourse(req, res) {
  try {
    const courseRepository = getManager().getRepository(Courses);
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const sortBy = req.query.sortBy || "id"; // Default to sorting by title
    const sortOrder = req.query.sortOrder || "DESC"; // Default to ascending order
    const search = req.query.search || "";

    const offset = (page - 1) * pageSize;

    const [courses, total] = await courseRepository
      .createQueryBuilder("course")
      .leftJoinAndSelect("course.category", "category") // Join with category
      .select([
        "course.id",
        "course.title",
        "course.description",
        "course.price",
        "course.imageUrl",
        "course.bannerUrl",
        "course.videoUrl",
        "course.discountPrice",
        "course.discountStart",
        "course.discountExpiration",
        "course.createdAt",
        "course.lastModified",
      ])
      .addSelect(["category.name"]) // Include category.name in the select
      .where("course.title LIKE :search", { search: `%${search}%` }) // Search by course title

      .orderBy(`course.${sortBy}`, sortOrder) // Add sorting
      .skip(offset)
      .take(pageSize)
      .getManyAndCount();

    // Convert createdAt and lastModified to Jalali calendar
    const jalaliCourses = courses.map((course) => ({
      ...course,
      createdAt: convertToJalaliDate(course.createdAt),
      lastModified: convertToJalaliDate(course.lastModified),
    }));

    res.json({
      courses: jalaliCourses,
      total,
    });
  } catch (error) {
    console.log(error);
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
      .json({ error: "An error occurred while creating the getProductByIdd." });
  }
}

module.exports = {
  getAllCourse,
  getProductById,
};
