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
      !enrollment.order.user.phone ||
      enrollment.order.orderStatus !== "success"
    ) {
      return res.status(401).json({ error: "شما این دوره را نخریده اید" });
    }

    // if (enrollment.order.orderStatus !== "success") {
    //   return res.status(401).json({ error: "شمااین دوره را خرید نکرده اید" });
    // }

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
      .andWhere("order.orderStatus = 'success'") // Add this line to filter by successful orders
      //.orderBy("order.createdAt", "DESC") // Order by creation date in descending order
      .getOne();

    if (
      !enrollment ||
      !enrollment.order ||
      !enrollment.order.user ||
      !enrollment.order.user.phone
    ) {
      return res
        .status(401)
        .json({ error: "شما در این دوره ثبت نام نکرده اید" });
    }
    console.log(enrollment.order.id);

    console.log(enrollment.order.orderStatus);
    if (enrollment.order.orderStatus !== "success") {
      return res.status(403).json({ error: "شما دوره نخریده اید" });
    }

    const result = await partRepository
      .createQueryBuilder("part")
      .select(["part.videoPath as videoPath", "part.videoType as videoType"])
      .where("part.courseId = :courseId", { courseId })
      .andWhere("part.id = :partId", { partId })
      .getRawOne();

    if (!result) {
      return res.status(404).json({ error: "آدرس ویدئو پیدا نشد" });
    }

    res.status(200).json({ result });
  } catch (error) {
    console.error(`Error in getVideoPathAfterEnrollWithPartId: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getVideoPathAfterEnrollWithPartId,
  getVideoPathAfterEnroll,
};
