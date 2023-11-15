// partController.js
const { getManager } = require("typeorm");
const Part = require("../model/Part"); // Import the Part Entity
const Chapter = require("../model/Chapter");
async function createPart(req, res) {
  try {
    const { chapterId, title, description, videoPath } = req.body;
    //const icon = req.file ? req.file.filename : null;

    const partRepository = getManager().getRepository(Part);
    const chapterRepository = getManager().getRepository(Chapter);

    // Check if the chapter exists
    const chapterExists = await chapterRepository.findOne({
      where: { id: chapterId },
    });
    if (!chapterExists) {
      return res.status(400).json({ error: "Chapter not found." });
    }

    const newPart = partRepository.create({
      chapterId,
      title,
      description,
     // icon,
      videoPath,
    });

    const savedPart = await partRepository.save(newPart);

    res.status(201).json(savedPart);
  } catch (error) {
    console.error(`Error creating part: ${error}`);
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

      res.json(updatedPart);
    } else {
      res.status(404).json({ error: "Part not found." });
    }
  } catch (error) {
    console.error(`Error editing part: ${error}`);
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

    res.json({ updatedPart, status: 200 });
  } catch (error) {
    console.error(`Error editing part with chapter ID: ${error}`);
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
      res.json({ message: "Part deleted successfully." });
    } else {
      res.status(404).json({ error: "Part not found." });
    }
  } catch (error) {
    console.error(`Error deleting part: ${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the part." });
  }
}
async function gatAllPart(req, res) {
  const partRepository = getManager().getRepository(Part);
  const parts = await partRepository.find();
  console.log(parts);
  res.json({ parts, status: 200 });
}
async function getAllPartsWithChapterId(req, res) {
  try {
    const chapterId = req.params.chapterId;

    const partRepository = getManager().getRepository(Part);
    const parts = await partRepository.find({
      where: { chapterId },
    });

    if (parts.length === 0) {
      return res.status(404).json({ error: "پارت یافت نشد برای سرفصل" });
    }

    res.json({ parts, status: 200 });
  } catch (error) {
    console.error(`Error retrieving parts with chapter ID: ${error}`);
    res.status(500).json({
      error: "An error occurred while retrieving parts with chapter ID.",
    });
  }
}

module.exports = {
  createPart,
  editPart,
  editPartWithChapterId,
  deletePart,
  gatAllPart,
  getAllPartsWithChapterId,
};



