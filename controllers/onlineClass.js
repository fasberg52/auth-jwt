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

module.exports = { createOnlineClass };
