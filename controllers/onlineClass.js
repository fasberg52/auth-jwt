const { getManager, getRepository } = require("typeorm");
const OnlineClass = require("../model/onlineCourse");
const Course = require("../model/Course");
const Enrollment = require("../model/Enrollment");

const {
  sendNotification,
  scheduleNotifications,
} = require("../services/sendMessage");

const moment = require("moment");
async function createOnlineClass(req, res) {
  const { title, startDate, endDate, courseId } = req.body;
  const onlineClassRepository = getRepository(OnlineClass);
  const courseRepository = getRepository(Course);
  const existingCourse = await courseRepository.findOne({
    where: { id: courseId },
  });

  if (!existingCourse) {
    return res.statur(404).json({ error: "این دوره وجود ندارد" });
  }
  const newOnlineClass = onlineClassRepository.create({
    title,
    startDate,
    endDate,
    course: existingCourse,
  });
  await onlineClassRepository.save(newOnlineClass);

  res.status(201).json({ message: "با موفقیت ساخته شد", status: 201 });
}
async function updateOnlineClass(req, res) {
  try {
    const { onlineClassId, title, startDate, endDate, courseId } = req.body;
    const onlineClassRepository = getRepository(OnlineClass);
    const courseRepository = getRepository(Course);
    const existingCourse = await courseRepository.findOne({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return res.status(404).json({ error: "این دوره وجود ندارد" });
    }

    const existingOnlineClass = await onlineClassRepository.findOne({
      where: { id: onlineClassId },
    });

    if (!existingOnlineClass) {
      return res.status(404).json({ error: "این کلاس آنلاین وجود ندارد" });
    }

    existingOnlineClass.title = title;
    existingOnlineClass.startDate = startDate;
    existingOnlineClass.endDate = endDate;
    existingOnlineClass.course = existingCourse;

    await onlineClassRepository.save(existingOnlineClass);

    res.status(200).json({ message: "با موفقیت به‌روزرسانی شد", status: 200 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteOnlineClass(req, res) {
  try {
    const { onlineClassId } = req.params;
    const onlineClassRepository = getRepository(OnlineClass);

    const existingOnlineClass = await onlineClassRepository.findOne({
      where: { id: onlineClassId },
    });

    if (!existingOnlineClass) {
      return res.status(404).json({ error: "این کلاس آنلاین وجود ندارد" });
    }

    await onlineClassRepository.remove(existingOnlineClass);

    res.status(200).json({ message: "با موفقیت حذف شد", status: 200 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getOnlineClass(req, res) {
  try {
    const { onlineClassId } = req.params;
    const onlineClassRepository = getRepository(OnlineClass);

    const onlineClass = await onlineClassRepository
      .createQueryBuilder("onlineClass")
      .leftJoinAndSelect("onlineClass.course", "course")
      .select([
        "onlineClass.id",
        "onlineClass.title",
        "onlineClass.startDate",
        "onlineClass.endDate",
        "course.id",
        "course.title",
      ])
      .where("onlineClass.id = :onlineClassId", { onlineClassId })
      .getOne();

    if (!onlineClass) {
      return res.status(404).json({ error: "این کلاس آنلاین وجود ندارد" });
    }

    res.status(200).json({ onlineClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllOnlineClasses(req, res) {
  try {
    const onlineClassRepository = getRepository(OnlineClass);

    const onlineClasses = await onlineClassRepository
      .createQueryBuilder("onlineClass")
      .leftJoinAndSelect("onlineClass.course", "course")
      .select([
        "onlineClass.id",
        "onlineClass.title",
        "onlineClass.startDate",
        "onlineClass.endDate",
        "course.id",
        "course.title",
      ])
      .getMany();

    res.status(200).json({ onlineClasses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function getTodayOnlineClasses(req, res) {
  try {
    const userPhone = req.user.phone;
    console.log(userPhone);

    const enrollmentRepository = getRepository(Enrollment);
    const onlineClassRepository = getRepository(OnlineClass);

    const enrolledCoursesQuery = await enrollmentRepository
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
    const enrolledCourses = await enrolledCoursesQuery.getRawMany();
    console.log("Enrolled Courses for getTodayOnlineClasses:", enrolledCourses);

    if (enrolledCourses.length === 0) {
      return res.status(404).json({ error: "شما دسترسی ندارید" });
    }

    const courseIds = enrolledCourses.map((enrollment) => enrollment.id);

    const todayStart = moment().startOf("day");
    const todayEnd = moment().endOf("day");
    const todayOnlineClasses = await onlineClassRepository
      .createQueryBuilder("onlineClass")
      .leftJoinAndSelect("onlineClass.course", "course")
      .select([
        "onlineClass.id",
        "onlineClass.title",
        "onlineClass.startDate",
        "onlineClass.endDate",
        "course.id",
        "course.title",
      ])
      .where("onlineClass.startDate >= :todayStart", {
        todayStart: todayStart.toDate(),
      })
      .andWhere("onlineClass.startDate <= :todayEnd", {
        todayEnd: todayEnd.toDate(),
      })
      .andWhere("course.id IN (:...courseIds)", { courseIds })
      .getMany();

    if (todayOnlineClasses.length === 0) {
      return res
        .status(404)
        .json({ error: "هیچ دوره‌ای برای امروز وجود ندارد" });
    }
    
    scheduleNotifications(todayOnlineClasses);

    res.status(200).json({ todayOnlineClasses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getFutureOnlineClasses(req, res) {
  try {
    const userPhone = req.user.phone;
    console.log(userPhone);
    const onlineClassRepository = getRepository(OnlineClass);
    const enrollmentRepository = getRepository(Enrollment);

    const enrolledCoursesQuery = await enrollmentRepository
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
    const enrolledCourses = await enrolledCoursesQuery.getRawMany();
    console.log(
      "Enrolled Courses for getFutureOnlineClasses:",
      enrolledCourses
    );

    if (enrolledCourses.length === 0) {
      return res.status(404).json({ error: "شما دسترسی ندارید" });
    }

    const courseIds = enrolledCourses.map((enrollment) => enrollment.id);

    const tomorrowStart = moment().add(1, "day").startOf("day");

    const futureOnlineClasses = await onlineClassRepository
      .createQueryBuilder("onlineClass")
      .leftJoinAndSelect("onlineClass.course", "course")
      .select([
        "onlineClass.id",
        "onlineClass.title",
        "onlineClass.startDate",
        "onlineClass.endDate",
        "course.id",
        "course.title",
        "course.imageUrl",
      ])
      .where("onlineClass.startDate >= :tomorrowStart", {
        tomorrowStart: tomorrowStart.toDate(),
      })
      .andWhere("course.id IN (:...courseIds)", { courseIds })
      .getMany();

    if (futureOnlineClasses.length === 0) {
      return res.status(404).json({ error: "دوره ای برای نمایش نیست" });
    }

    res.status(200).json({ futureOnlineClasses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  createOnlineClass,
  updateOnlineClass,
  deleteOnlineClass,
  getOnlineClass,
  getAllOnlineClasses,
  getTodayOnlineClasses,
  getFutureOnlineClasses,
};