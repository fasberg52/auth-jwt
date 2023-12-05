//controller/enrollment.js

const { getManager, getRepository, getTreeRepository } = require("typeorm");
const User = require("../model/users");
const Part = require("../model/Part");
const Chapter = require("../model/Chapter");
const Enrollment = require("../model/Enrollment");
const logger = require("../services/logger");

async function getAllEnrollment(req, res) {}

async function getVideoPathAfterEnroll(req, res) {
  try {
    const courseId = req.params.courseId;
    const userPhone = req.user.phone;

    const enrollmentRepository = getManager().getRepository(Enrollment);
    const partRepository = getManager().getRepository(Part);

    const enrollment = await enrollmentRepository
      .createQueryBuilder("enrollment")
      .innerJoinAndSelect("enrollment.order", "order")
      .innerJoinAndSelect("order.user", "user")
      .where("enrollment.courseId = :courseId", { courseId })
      .andWhere("user.phone = :phone", { phone: userPhone })
      .getOne();

    if (
      !enrollment ||
      !enrollment.order ||
      !enrollment.order.user ||
      !enrollment.order.user.phone
    ) {
      return res.status(401).json({ error: "شما ثبت نام نکرده اید" });
    }

    // Check if the orderStatus is successful
    if (enrollment.order.orderStatus !== "success") {
      return res.status(401).json({ error: "شمااین دوره را خرید نکرده اید" });
    }

    // User is enrolled, order is successful, get video paths for the course using QueryBuilder
    const videoPaths = await partRepository
      .createQueryBuilder("part")
      .select(["part.id as id", "part.videoPath as videoPath"])
      .where("part.courseId = :courseId", { courseId })
      .getRawMany();

    res.status(200).json({ videoPaths });
  } catch (error) {
    console.error(`Error in getVideoPathAfterEnroll: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getVideoPathAfterEnrollWithPartId(req, res) {
  try {
    const courseId = req.params.courseId;
    const partId = req.params.partId;
    const userPhone = req.user.phone;

    const enrollmentRepository = getManager().getRepository(Enrollment);
    const partRepository = getManager().getRepository(Part);

    const enrollment = await enrollmentRepository
      .createQueryBuilder("enrollment")
      .innerJoinAndSelect("enrollment.order", "order")
      .innerJoinAndSelect("order.user", "user")
      .where("enrollment.courseId = :courseId", { courseId })
      .andWhere("user.phone = :phone", { phone: userPhone })
      .getOne();

    if (!enrollment || !enrollment.order || !enrollment.order.user || !enrollment.order.user.phone) {
      return res.status(401).json({ error: "User is not enrolled in the course." });
    }

    // Check if the orderStatus is successful
    if (enrollment.order.orderStatus !== 'success') {
      return res.status(401).json({ error: "Order status is not successful." });
    }

    // User is enrolled, order is successful, get video path for the specific part using QueryBuilder
    const videoPath = await partRepository
      .createQueryBuilder("part")
      .select("part.videoPath", "videoPath")
      .where("part.courseId = :courseId", { courseId })
      .andWhere("part.id = :partId", { partId })
      .getRawOne();

    if (!videoPath) {
      return res.status(404).json({ error: "Video path not found for the specified part." });
    }

    res.status(200).json({ videoPath });
  } catch (error) {
    console.error(`Error in getVideoPathAfterEnrollWithPartId: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}


module.exports = {
  getVideoPathAfterEnrollWithPartId,
  getVideoPathAfterEnroll,
};
