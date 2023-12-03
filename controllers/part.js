// partController.js
const { getManager } = require("typeorm");
const Part = require("../model/Part");
const Chapter = require("../model/Chapter");
const SecureLink = require("../model/secureLink");
const logger = require("../services/logger");
const ffmpeg = require("fluent-ffmpeg");
const crypto = require("crypto");
const dotenv = require("dotenv").config();
//ffmpeg.setFfmpegPath("C:/Program Files (x86)/ffmpeg/bin/ffmpeg");
ffmpeg.setFfprobePath(`${process.env.FFPROB_PATH}`);

async function createPart(req, res) {
  try {
    const { courseId, chapterId, title, description, videoPath } = req.body;
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

    const newPart = partRepository.create({
      courseId,
      chapterId,
      title,
      description,

      videoPath,
      videoDuration,
    });

    const savedPart = await partRepository.save(newPart);

    const secureLink = await createSecureLink(videoPath);
    savedPart.secureLink = secureLink;

    logger.info("Part created", {
      courseId,
      chapterId,
      title,
      description,
      videoPath,
      videoDuration,
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
    const { title, description, icon, videoPath } = req.body;
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

      // Save the updated part
      existingPart.lastModified = new Date();
      const updatedPart = await partRepository.save(existingPart);

      logger.info("Part edited", {
        partId,
        title,
        description,
        icon,
        videoPath,
      });

      res.json(updatedPart);
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
    const [parts, totalCount] = await partRepository.findAndCount({
      where: { courseId },
    });

    if (parts.length === 0) {
      logger.warn("No parts found for the specified course ID", { courseId });

      return res.status(404).json({ error: "پارت یافت نشد برای دوره" });
    }

    logger.info("All parts retrieved for course ID", { courseId, parts });

    res.json({ parts, totalCount, status: 200 });
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

async function createSecureLink(originalLink) {
  const token = crypto.randomBytes(16).toString("hex");

  const secureLinkRepository = getManager().getRepository(SecureLink);
  const secureLink = secureLinkRepository.create({
    originalLink,
    token,
  });

  await secureLinkRepository.save(secureLink);

  return token;
}
async function getAllChaptersAndParts(req, res) {
  try {
    const { courseId } = req.params;

    const chapterRepository = getManager().getRepository(Chapter);
    const partRepository = getManager().getRepository(Part);

    const chapters = await chapterRepository
      .createQueryBuilder("chapter")
      .leftJoin("chapter.parts", "part")
      .select(["chapter.id", "chapter.title","chapter.orderIndex"])
      .addSelect(["part.id", "part.title", "part.description"])
      .where("chapter.courseId = :courseId", { courseId })
      .getMany();

    if (chapters.length === 0) {
      logger.warn("No chapters found for the specified course ID", {
        courseId,
      });

      return res.status(404).json({ error: "فصلی یافت نشد برای دوره" });
    }

    // Create a map to group parts by chapter
    // const chaptersWithParts = new Map();
    // chapters.forEach((chapter) => {
    //   const { id, title } = chapter;
    //   if (!chaptersWithParts.has(id)) {
    //     chaptersWithParts.set(id, { id, title, parts: [] });
    //   }
    //   const chapterWithParts = chaptersWithParts.get(id);
    //   chapterWithParts.parts.push({
    //     id: chapter.parts.id,
    //     title: chapter.parts.title,
    //     description: chapter.parts.description,
    //   });
    // });

    // const result = Array.from(chaptersWithParts.values());

    logger.info("All chapters and parts retrieved for course ID", {
      courseId,
      chapters,
    });

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
