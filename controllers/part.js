// partController.js
const { getManager } = require("typeorm");
const Part = require("../model/Part");
const Chapter = require("../model/Chapter");
// const SecureLink = require("../model/secureLink");
const logger = require("../services/logger");
const ffmpeg = require("fluent-ffmpeg");
const crypto = require("crypto");
const dotenv = require("dotenv").config();
//ffmpeg.setFfmpegPath("C:/Program Files (x86)/ffmpeg/bin/ffmpeg");
ffmpeg.setFfprobePath(`${process.env.FFPROB_PATH}`);

async function createPart(req, res) {
  try {
    const { courseId, chapterId, title, description, videoPath, isFree } =
      req.body;
    //const icon = req.file ? req.file.filename : null;
    const videoDuration = await getVideoDuration(videoPath);

    const partRepository = getManager().getRepository(Part);
    const chapterRepository = getManager().getRepository(Chapter);

    const chapterExists = await chapterRepository.findOne({
      where: { id: chapterId },
    });
    if (!chapterExists) {
      return res.status(400).json({ error: "Chapter not found." });
    }

    const [result] = await partRepository.query(
      'SELECT COUNT(*) FROM parts WHERE "chapterId" = $1',
      [chapterId]
    );
    const partCount = parseInt(result.count);

    console.log(`>> partCount ${partCount}`);

    // Step 2: Set the orderIndex for the new part to the current partCount
    const orderIndex = partCount;
    console.log(`>> orderIndex ${orderIndex}`);

    const newPart = partRepository.create({
      
      courseId,
      chapterId,
      title,
      description,
      orderIndex,
      videoPath,
      videoDuration,
      isFree
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
      isFree
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
    const { title, description, icon, videoPath, orderIndex, isFree } = req.body;
    const partRepository = getManager().getRepository(Part);
    const partId = req.params.id;

    const existingPart = await partRepository.findOne({
      where: { id: partId },
    });

    if (existingPart) {
      existingPart.title = title;
      existingPart.description = description;
      existingPart.icon = icon;
      existingPart.videoPath = videoPath;
      existingPart.orderIndex = orderIndex; // Add this line
      existingPart.isFree = isFree; // Add this line

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
      });

      res.json({ message: "Part updated successfully", updatedPart });
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

      res.json({ message: "Part deleted successfully." });
    } else {
      res.status(404).json({ error: "Part not found." });
    }
  } catch (error) {
    logger.error(`Error deleting part: ${error}`);

    res
      .status(500)
      .json({ error: "An error occurred while deleting the part." });
  }
}
async function gatAllPartwithCourseId(req, res) {
  try {
    const { courseId } = req.params;

    const partRepository = getManager().getRepository(Part);

    // Retrieve parts and count
    const parts = await partRepository.find({
      where: { courseId },
    });

    if (parts.length === 0) {
      logger.warn("No parts found for the specified course ID", { courseId });
      return res.status(404).json({ error: "پارت یافت نشد برای دوره" });
    }

    const totalDuration = calculateTotalDuration(parts);

    logger.info("All parts retrieved for course ID", {
      courseId,
      parts,
      totalDuration,
    });

    res.json({ parts, totalDuration, status: 200 });
  } catch (error) {
    logger.error(`Error retrieving parts with course ID: ${error}`);
    res.status(500).json({
      error: "An error occurred while retrieving parts with course ID.",
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

async function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error(`Error getting video duration: ${err}`);
        reject(err);
      } else {
        const durationInSeconds = metadata.format.duration;
        const formattedDuration = formatVideoDuration(durationInSeconds);
        resolve(formattedDuration);
      }
    });
  });
}

function formatVideoDuration(durationInSeconds) {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = Math.floor(durationInSeconds % 60);

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

function calculateTotalDuration(parts) {
  let totalDurationInSeconds = 0;

  parts.forEach((part) => {
    totalDurationInSeconds += parseDurationToSeconds(part.videoDuration);
  });

  const totalDuration = formatVideoDuration(totalDurationInSeconds);
  return totalDuration;
}

function parseDurationToSeconds(duration) {
  const [hours, minutes, seconds] = duration.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
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
        "CASE WHEN COALESCE(part.isFree, false) THEN part.videoPath ELSE null END as videoPath",
      ])
      .where("chapter.courseId = :courseId", { courseId })
      .getRawMany();

    // //     const chapters = await getManager().query(
    // //       `
    // //   SELECT
    // //     c.id as chapter_id,
    // //     c.title as chapter_title,
    // //     c."orderIndex" as chapter_orderIndex,
    // //     c."courseId" as chapter_courseId,
    // //     p.id as part_id,
    // //     p.title as part_title,
    // //     p.description as part_description,
    // //     p."videoDuration" as part_videoDuration,
    // //     p."isFree" as part_isFree,
    // //     CASE
    // //       WHEN p."isFree" THEN p."videoPath"
    // //       ELSE null
    // //     END as part_videoPath
    // //   FROM chapters c
    // //   LEFT JOIN parts p ON c.id = p."chapterId"  -- Update this line with the correct case
    // //   WHERE c."courseId" = $1
    // // `,
    //       [courseId]
    //     );

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

module.exports = {
  createPart,
  editPart,
  editPartWithChapterId,
  deletePart,
  gatAllPartwithCourseId,
  getAllPartsWithChapterId,
  getAllChaptersAndParts,
};
