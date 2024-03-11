//controllers/course.js
const Courses = require("../model/Course");
const Filter = require("../model/Filter");

const { getManager, getRepository } = require("typeorm");
const Enrollment = require("../model/Enrollment");
const logger = require("../services/logger");

//const cacheService = require("../services/cacheService");

async function getAllCourse(req, res) {
  try {
    const courseRepository = getManager().getRepository(Courses);
    const isFetchAll = req.query.all === "true";

    if (isFetchAll) {
      const courses = await courseRepository
        .createQueryBuilder("course")
        .leftJoinAndSelect("course.category", "category")
        .leftJoin("course.filters", "filter")
        .select(["course.id", "course.title"])
        .getMany();

      return res.json({
        courses,
        totalCount: courses.length,
        totalPages: 1,
      });
    }
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const sortBy = req.query.sortBy || "id";
    const sortOrder = req.query.sortOrder || "DESC";
    const searchQuery = req.query.search || null;

    if (isNaN(page) || page < 1) {
      return res.status(400).json({ error: "Invalid page number" });
    }

    const offset = (page - 1) * pageSize;

    const queryBuilder = courseRepository
      .createQueryBuilder("course")
      .leftJoinAndSelect("course.category", "category")
      .leftJoin("course.filters", "filter")
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
      ]);

    if (searchQuery) {
      queryBuilder.andWhere("course.title ILIKE :searchQuery", {
        searchQuery: `%${searchQuery}%`,
      });
    } else if (req.query.search === "") {
      const courses = [];
      return res.status(200).json(courses);
    }

    const [courses, totalCount] = await queryBuilder
      .orderBy(`course.${sortBy}`, sortOrder)
      .skip(offset)
      .take(pageSize)
      .getManyAndCount();

    res.json({
      courses,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    console.error("Error in getAllCourse", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching courses." });
  }
}

// async function getCourseById(req, res) {
//   const cacheKey = "getCourseById";
//   try {
//     // const cachedData = await cacheService.get(cacheKey);
//     // console.log(`cacheKey >>> ${JSON.stringify(cachedData)}`);
//     // if (cachedData !== undefined) {
//     //   console.log("Data found in cache. Returning cached data.");
//     //   const { existingCourse } = cachedData;
//     //   console.log(cacheKey);
//     //   // If data is found in the cache, return it
//     //   return res.json({ existingCourse });
//     // } else {
//     console.log("Data NOT found in cache. Returning cached data.");

//     const userPhone = req.user.phone;
//     const enrollmentRepository = getManager().getRepository(Enrollment);

//     const courseRepository = getManager().getRepository(Courses);
//     const courseId = req.params.courseId;

//     // Fetch the course with related chapters, parts, and category
//     const existingCourse = await courseRepository
//       .createQueryBuilder("course")
//       .leftJoin("course.category", "category")
//       .select([
//         "course.id",
//         "course.title",
//         "course.description",
//         "course.price",
//         "course.discountPrice",
//         "course.discountStart",
//         "course.discountExpiration",
//         "course.imageUrl",
//         "course.bannerUrl",
//         "course.videoUrl",
//         "course.createdAt",
//         "course.lastModified",
//       ])
//       .addSelect(["category.id", "category.name"])
//       .where("course.id = :courseId", { courseId })
//       .getOne();

//     const isEnrolled = await enrollmentRepository
//       .createQueryBuilder("enrollment")
//       .innerJoin("enrollment.course", "course")
//       .innerJoin("enrollment.order", "order")
//       .innerJoin("order.user", "user")
//       .where("course.id = :courseId", { courseId })
//       .andWhere("user.phone = :phone", { phone: userPhone })
//       .getCount();

//     if (!isEnrolled) {
//       return res
//         .status(401)
//         .json({ error: "کاربر ثبت نام نکرده است" });
//     }

//     if (existingCourse) {
//       // Convert dates to Jalali format
//       existingCourse.discountStart = jalaliMoment(
//         existingCourse.discountStart
//       ).format("YYYY/MM/DD HH:mm:ss");
//       existingCourse.discountExpiration = jalaliMoment(
//         existingCourse.discountExpiration
//       ).format("YYYY/MM/DD HH:mm:ss");
//       existingCourse.createdAt = jalaliMoment(existingCourse.createdAt).format(
//         "YYYY/MMMM/DD"
//       );
//       existingCourse.lastModified = jalaliMoment(
//         existingCourse.lastModified
//       ).format("YYYY/MMMM/DD");

//       const { price, ...cachedCourse } = existingCourse;

//       await cacheService.set(cacheKey, { cachedCourse }, 86400 * 1000);

//       logger.info(`getCourseById successful for courseId ${courseId}`);
//       res.json(existingCourse);
//     } else {
//       logger.info(`getCourseById failed for courseId ${courseId}`);
//       res.status(404).json({ error: "Course not found." });
//     }
//     // }
//   } catch (error) {
//     logger.error(`Error in getCourseById for courseId ${req.params.courseId}`, {
//       error,
//     });

//     console.log(`>>>>${error}`);
//     res
//       .status(500)
//       .json({ error: "An error occurred while retrieving the course." });
//   }
// }
async function getAllCourseForOnline(req, res) {
  const courseRepository = getRepository(Courses);
  const courses = await courseRepository.find({
    select: ["id", "title"],
  });

  res.status(200).json(courses);
}
async function getCourseById(req, res) {
  try {
    const userPhone = req.user.phone;

    const enrollmentRepository = getManager().getRepository(Enrollment);
    const courseId = req.params.courseId;

    const isEnrolled = await enrollmentRepository
      .createQueryBuilder("enrollment")
      .innerJoin("enrollment.course", "course")
      .innerJoin("enrollment.order", "o")
      .innerJoin("o.user", "user")
      .where("course.id = :courseId", { courseId })
      .andWhere("user.phone = :phone", { phone: userPhone })
      .andWhere("o.orderStatus = :orderStatus", { orderStatus: "success" })
      .getCount();

    const courseRepository = getManager().getRepository(Courses);

    const existingCourse = await courseRepository
      .createQueryBuilder("course")
      .leftJoin("course.category", "category")
      .select([
        "course.id",
        "course.title",
        "course.description",
        "course.price",
        "course.discountPrice",
        "course.discountStart",
        "course.discountExpiration",
        "course.backgroundColor",
        "course.imageUrl",
        "course.bannerUrl",
        "course.videoUrl",
        "course.createdAt",
        "course.lastModified",
      ])
      .addSelect(["category.id", "category.name"])
      .where("course.id = :courseId", { courseId })
      .getOne();

    if (existingCourse) {
      if (
        existingCourse.discountExpiration &&
        new Date() > existingCourse.discountExpiration
      ) {
        existingCourse.discountExpiration = null;
        existingCourse.discountStart = null;
        existingCourse.discountPrice = null;
        await courseRepository.save(existingCourse);
      }

      if (!isEnrolled) {
        res.json({ access: false, ...existingCourse });
      } else {
        res.json({ access: true, ...existingCourse });
      }
    } else {
      logger.info(`getCourseById failed for courseId ${courseId}`);
      res.status(404).json({ error: "Course not found." });
    }
  } catch (error) {
    logger.error(`Error in getCourseById for courseId ${req.params.courseId}`, {
      error,
    });

    res.status(500).json({ error });
  }
}

async function getCourseUserWithToken(req, res) {
  try {
    const userPhone = req.user.phone;

    const enrollmentRepository = getManager().getRepository(Enrollment);

    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const enrolledCoursesQuery = enrollmentRepository
      .createQueryBuilder("enrollment")
      .leftJoin("enrollment.course", "course")
      .leftJoin("course.category", "category")
      .leftJoin("enrollment.order", "o")
      .leftJoin("o.user", "user")
      .where("user.phone = :phone", { phone: userPhone })
      .andWhere("o.orderStatus = :orderStatus", { orderStatus: "success" })
      .select([
        "course.id as id",
        "course.title as title",
        "course.price as price",
        "course.discountPrice as discountPrice",
        "course.imageUrl as imageUrl",
      ])
      .addSelect(["o.orderDate as orderDate"]);

    const totalCount = await enrolledCoursesQuery.getCount();

    const enrolledCourses = await enrolledCoursesQuery
      .skip(skip)
      .take(take)
      .getRawMany();

    const onlyCount = req.query.onlyCount === "true";
    if (onlyCount) {
      const total = totalCount;
      res.status(200).json({ total });
      return;
    }

    res.status(200).json({
      enrolledCourses: enrolledCourses,
      totalCount,
      status: 200,
    });
  } catch (error) {
    logger.error(`Error in getCourseUserWithToken: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
module.exports = {
  getAllCourse,
  getCourseById,
  getCourseUserWithToken,
  getAllCourseForOnline,
};
