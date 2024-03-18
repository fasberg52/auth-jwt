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
      .andWhere("order.orderStatus = 'success'")
      //.orderBy("order.createdAt", "DESC")
      .getOne();

    if (
      !enrollment ||
      !enrollment.order ||
      !enrollment.order.user ||
      !enrollment.order.user.phone ||
      enrollment.order.orderStatus !== "success"
    ) {
      return res
        .status(403)
        .json({ error: "شما در این دوره ثبت نام نکرده اید" });
    }

    const result = await partRepository
      .createQueryBuilder("part")
      .select([
        "part.videoPath as videoPath",
        "part.videoType as videoType",
        "part.noteUrl as noteUrl",
      ])
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

async function getVideoPathWithOutEnrollWithPartId(req, res) {
  try {
    const { courseId, partId } = req.params;

    const partRepository = getManager().getRepository(Part);

    const part = await partRepository
      .createQueryBuilder("part")
      .select([
        "part.videoPath as videoPath",
        "part.videoType as videoType",
        "part.noteUrl as noteUrl",
        "part.isFree as isFree",
      ])
      .where("part.courseId = :courseId", { courseId })
      .andWhere("part.id = :partId", { partId })
      .andWhere("part.isFree = :isFree", { isFree: true })
      .getRawOne();

    if (!part) {
      return res.status(404).json({ error: "آدرس ویدئو پیدا نشد" });
    }

    res.status(200).json({ part });
  } catch (error) {
    console.error(`Error in getVideoPathWithOutEnrollWithPartId: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getVideoPathAfterEnrollWithPartId,
  getVideoPathAfterEnroll,
  getVideoPathWithOutEnrollWithPartId,
};
