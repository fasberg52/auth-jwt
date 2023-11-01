// partController.js
const { getManager } = require("typeorm");
const Part = require("../model/Part"); // Import the Part Entity

async function createPart(req, res) {
  try {
    const { chapterId, title, description, icon, videoPath } = req.body;
    const partRepository = getManager().getRepository(Part);

    // Check if the chapter exists
    const chapterExists = await chapterRepository.findOne(chapterId);
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
    res.status(500).json({ error: "An error occurred while creating the part." });
  }
}
