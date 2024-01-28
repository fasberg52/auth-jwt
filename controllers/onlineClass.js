const { getRepository } = require("typeorm");
const OnlineClass = require("../model/onlineCourse");
const Course = require("../model/Course");
async function createOnlineClass(req, res) {
  const { title, startDate, endDate, courseId } = req.body;
  const onlineClassRepository = getRepository(OnlineClass);
  const courseRepository = getRepository(Course);
  const existingCourse = await courseRepository.findOne({ where: { id: id } });
  if (!existingCourse) {
    return res.statur(404).json({ error: "این دوره وجود ندارد" });
  }
  const newOnlineClass = onlineClassRepository.create({
    title,
    startDate,
    endDate,
    existingCourse,
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

    const existingOnlineClass = await onlineClassRepository.findOne(
      onlineClassId
    );

    if (!existingOnlineClass) {
      return res.status(404).json({ error: "این کلاس آنلاین وجود ندارد" });
    }

    existingOnlineClass.title = title;
    existingOnlineClass.startDate = startDate;
    existingOnlineClass.endDate = endDate;
    existingOnlineClass.existingCourse = existingCourse;

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

async function getOnlineClass(req, res) {}

module.exports = { createOnlineClass, updateOnlineClass, deleteOnlineClass };
