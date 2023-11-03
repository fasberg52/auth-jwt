// partController.js
const { getManager } = require("typeorm");
const Part = require("../model/Part"); // Import the Part Entity
const Chapter = require("../model/Chapter");
async function createPart(req, res) {
  try {
    const { chapterId, title, description, videoPath } = req.body;
    const icon = req.file ? req.file.filename : null;

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
      icon,
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

module.exports = {
  createPart,
  editPart,
  deletePart,
};
