// chapterController.js
const { getManager } = require("typeorm");
const Chapter = require("../model/Chapter"); // Import the Chapter Entity

async function createChapter(req, res) {
  try {
    const { courseId, title, icon } = req.body;
    const chapterRepository = getManager().getRepository(Chapter);

    // Check if the course exists
    const courseExists = await courseRepository.findOne(courseId);
    if (!courseExists) {
      return res.status(400).json({ error: "Course not found." });
    }

    const newChapter = chapterRepository.create({
      courseId,
      title,
      icon,
    });

    const savedChapter = await chapterRepository.save(newChapter);

    res.status(201).json(savedChapter);
  } catch (error) {
    console.error(`Error creating chapter: ${error}`);
    res.status(500).json({ error: "An error occurred while creating the chapter." });
  }
}

async function editChapter(req, res) {
  try {
    const { title, icon } = req.body;
    const chapterRepository = getManager().getRepository(Chapter);
    const chapterId = req.params.id;

    const existingChapter = await chapterRepository.findOne({
      where: { id: chapterId },
    });

    if (existingChapter) {
      existingChapter.title = title;
      existingChapter.icon = icon;

      // Save the updated chapter
      existingChapter.lastModified = new Date();
      const updatedChapter = await chapterRepository.save(existingChapter);

      res.json(updatedChapter);
    } else {
      res.status(404).json({ error: "Chapter not found." });
    }
  } catch (error) {
    console.error(`Error editing chapter: ${error}`);
    res.status(500).json({ error: "An error occurred while editing the chapter." });
  }
}

async function deleteChapter(req, res) {
  try {
    const chapterRepository = getManager().getRepository(Chapter);
    const chapterId = req.params.id;

    const existingChapter = await chapterRepository.findOne({
      where: { id: chapterId },
    });

    if (existingChapter) {
      await chapterRepository.remove(existingChapter);
      res.json({ message: "Chapter deleted successfully." });
    } else {
      res.status(404).json({ error: "Chapter not found." });
    }
  } catch (error) {
    console.error(`Error deleting chapter: ${error}`);
    res.status(500).json({ error: "An error occurred while deleting the chapter." });
  }
}

module.exports = {
  createChapter,
  editChapter,
  deleteChapter,
};
