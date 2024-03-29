// partController.js
const { getManager, In } = require("typeorm");
const UserPartStatus = require("../model/UserPart");
const Part = require("../model/Part");
const Chapter = require("../model/Chapter");
// const SecureLink = require("../model/secureLink");
const logger = require("../services/logger");
const { getVideoDurationFromApi } = require("../services/video.api");

async function createPart(req, res) {
  try {
    const {
      courseId,
      chapterId,
      title,
      description,
      videoPath,
      isFree,
      videoType,
      noteUrl,
    } = req.body;

    let videoDuration;

    if (videoType === "normal") {
      videoDuration = req.body.videoDuration;
    } else if (videoType === "embed") {
      videoDuration = await getVideoDurationFromApi(videoPath);
    } else {
      videoDuration = "00:00:00";
    }

    const partRepository = getManager().getRepository(Part);
    const chapterRepository = getManager().getRepository(Chapter);

    const chapterExists = await chapterRepository.findOne({
      where: { id: chapterId },
    });
    if (!chapterExists) {
      return res.status(400).json({ error: "Chapter not found." });
    }

    // const [result] = await partRepository.query(
    //   'SELECT COUNT(*) FROM parts WHERE "chapterId" = $1',
    //   [chapterId]
    // );
    // const partCount = parseInt(result.count);

    // console.log(`>> partCount ${partCount}`);

    // const orderIndex = partCount;

    const partCount = await partRepository.count({
      where: { chapterId },
    });

    const orderIndex = partCount + 1;

    const newPart = partRepository.create({
      courseId,
      chapterId,
      title,
      description,
      orderIndex,
      videoPath,
      videoDuration,
      isFree,
      videoType,
      noteUrl,
    });

    const savedPart = await partRepository.save(newPart);

    // const secureLink = await createSecureLink(videoPath);
    // savedPart.secureLink = secureLink;

    logger.info("Part created", {
      courseId,
      chapterId,
      title,
      description,
      videoPath,
      videoDuration,
      orderIndex,
      isFree,
      noteUrl,
    });

    res.status(201).json({ message: "جلسه ساخته شد", savedPart, status: 201 });
  } catch (error) {
    logger.error(`Error creating part: ${error}`);

    res
      .status(500)
      .json({ error: "An error occurred while creating the part." });
  }
}

async function editPart(req, res) {
  try {
    const {
      title,
      description,
      icon,
      videoPath,
      orderIndex,
      videoType,
      isFree,
      noteUrl,
    } = req.body;
    const partRepository = getManager().getRepository(Part);
    const partId = req.params.id;
    //const videoDuration = await getVideoDuration(videoPath);

    let videoDuration;

    if (videoType === "normal") {
      videoDuration = req.body.videoDuration;
    } else if (videoType === "embed") {
      videoDuration = await getVideoDurationFromApi(videoPath);
    } else {
      videoDuration = "00:00:00";
    }

    const existingPart = await partRepository.findOne({
      where: { id: partId },
    });

    if (existingPart) {
      existingPart.title = title;
      existingPart.description = description;
      existingPart.icon = icon;
      existingPart.videoPath = videoPath;
      existingPart.orderIndex = orderIndex;
      existingPart.isFree = isFree;
      existingPart.noteUrl = noteUrl;
      existingPart.videoDuration = videoDuration;

      // Save the updated part
      existingPart.lastModified = new Date();
      const updatedPart = await partRepository.save(existingPart);

      logger.info("Part edited", {
        partId,
        title,
        description,
        icon,
        videoPath,
        orderIndex,
        isFree,
        noteUrl,
        videoDuration,
        //videoDuration,
      });

      res.status(200).json({
        message: "پارت با موفقیت بروزرسانی شد",
        updatedPart,
        status: 200,
      });
    } else {
      res.status(404).json({ error: "Part not found." });
    }
  } catch (error) {
    logger.error(`Error editing part: ${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while editing the part." });
  }
}

async function editPartWithChapterId(req, res) {
  try {
    const { title, description, videoPath } = req.body;
    const { courseId, chapterId, partId } = req.params;
    const partRepository = getManager().getRepository(Part);

    const existingPart = await partRepository.findOne({
      where: { id: partId, chapterId },
    });

    if (!existingPart) {
      res
        .status(404)
        .json({ error: "Part not found in the specified chapter." });
    }

    existingPart.title = title;
    existingPart.description = description;
    existingPart.videoPath = videoPath;

    // Check if there's a file upload and update the icon if needed
    if (req.file) {
      existingPart.icon = req.file.filename;
    }

    existingPart.lastModified = new Date();
    const updatedPart = await partRepository.save(existingPart);

    logger.info("Part edited with chapter ID", {
      partId,
      chapterId,
      title,
      description,
      videoPath,
    });

    res.json({ updatedPart, status: 200 });
  } catch (error) {
    logger.error(`Error editing part with chapter ID: ${error}`);

    res.status(500).json({
      error: "An error occurred while editing the part with chapter ID.",
    });
  }
}

async function deletePart(req, res) {
  try {
    const partRepository = getManager().getRepository(Part);
    const partId = req.params.id;

    const existingPart = await partRepository.findOne({
      where: { id: partId },
    });

    if (existingPart) {
      await partRepository.remove(existingPart);

      logger.info("Part deleted successfully", { partId });

      res.status(200).json({ message: "پارت با موفقیت پاک شد", status: 200 });
    } else {
      res.status(404).json({ error: "پارت پیدا نشد", status: 404 });
    }
  } catch (error) {
    logger.error(`Error deleting part: ${error}`);

    res.status(500).json({ error: "Internal Error Server" });
  }
}
async function gatAllPartwithCourseId(req, res) {
  try {
    const { courseId } = req.params;
    const phone = req.user.phone;

    const partRepository = getManager().getRepository(Part);

    const partsWithStatusQuery = await partRepository
      .createQueryBuilder("part")
      .leftJoin("UserPart", "up", "up.partId = part.id AND up.phone = :phone", {
        phone,
      })
      .where("part.courseId = :courseId", { courseId })
      .select([
        "part.id",
        "part.title",
        "COALESCE(up.isRead, false) AS isRead",
      ]);
    const [partsWithStatus, totalCount] = await Promise.all([
      partsWithStatusQuery.getRawMany(),
      partsWithStatusQuery.getCount(),
    ]);

    logger.info("Part list retrieved with read status for user", {
      phone,
      courseId,
      partsWithStatus,
    });

    res.json({
      result: partsWithStatus,
      totalCount,
      status: 200,
    });
  } catch (error) {
    logger.error(`Error retrieving parts with read status: ${error}`);
    res.status(500).json({
      error: "An error occurred while retrieving parts with read status.",
    });
  }
}

async function getAllPartsWithChapterId(req, res) {
  try {
    const { chapterId, courseId } = req.params;

    const partRepository = getManager().getRepository(Part);
    const parts = await partRepository.find({
      where: { chapterId },
    });

    if (parts.length === 0) {
      logger.warn("No parts found for the specified chapter ID", { chapterId });

      return res.status(404).json({ error: "پارت یافت نشد برای سرفصل" });
    }

    logger.info("All parts retrieved for chapter ID", { chapterId, parts });

    res.json({ parts, status: 200 });
  } catch (error) {
    logger.error(`Error retrieving parts with chapter ID: ${error}`);

    res.status(500).json({
      error: "An error occurred while retrieving parts with chapter ID.",
    });
  }
}

// async function createSecureLink(originalLink) {
//   const token = crypto.randomBytes(16).toString("hex");

//   const secureLinkRepository = getManager().getRepository(SecureLink);
//   const secureLink = secureLinkRepository.create({
//     originalLink,
//     token,
//   });

//   await secureLinkRepository.save(secureLink);

//   return token;
// }
async function getAllChaptersAndParts(req, res) {
  try {
    const { courseId } = req.params;

    const chapters = await getManager()
      .createQueryBuilder(Chapter, "chapter")
      .leftJoin("chapter.parts", "part")
      .select([
        "chapter.id",
        "chapter.title",
        "chapter.orderIndex",
        "chapter.courseId",
      ])
      .addSelect([
        "part.id",
        "part.title",
        "part.description",
        "part.videoDuration",
        "part.isFree",
        "part.orderIndex",
      ])
      .where("chapter.courseId = :courseId", { courseId: parseInt(courseId) })
      .orderBy("chapter.orderIndex", "ASC")
      .addOrderBy("part.orderIndex", "ASC")
      .getMany();

    if (chapters.length === 0) {
      logger.warn("No chapters found for the specified course ID", {
        courseId,
      });

      return res.status(404).json({ error: "فصلی یافت نشد برای دوره" });
    }

    res.json({ chapters, status: 200 });
  } catch (error) {
    logger.error(
      `Error retrieving chapters and parts with course ID: ${error}`
    );

    res.status(500).json({
      error:
        "An error occurred while retrieving chapters and parts with course ID.",
    });
  }
}

async function getVideoPathWithPartId(req, res) {
  try {
    const { partId } = req.params;

    const partRepository = getManager().getRepository(Part);

    const part = await partRepository.findOne({
      where: { id: partId },
    });

    if (!part) {
      logger.warn("Part not found for the specified part ID", { partId });
      return res.status(404).json({ error: "پارت یافت نشد", status: 404 });
    }

    if (part.isFree) {
      return res.status(200).json({ videoPath: part.videoPath, status: 200 });
    } else {
      return res.status(403).json({ error: "شما دسترسی ندارید", status: 403 });
    }
  } catch (error) {
    logger.error(`Error retrieving video path with part ID: ${error}`);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
}

module.exports = {
  createPart,
  editPart,
  editPartWithChapterId,
  deletePart,
  gatAllPartwithCourseId,
  getAllPartsWithChapterId,
  getAllChaptersAndParts,
  getVideoPathWithPartId,
};
