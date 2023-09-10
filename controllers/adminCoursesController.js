const Courses = require("../model/Course");
const { getManager } = require("typeorm");

async function addCourse(req, res) {
  const course = { id, title, description, price, imageUrl, videoUrl } =
    req.body;
}
