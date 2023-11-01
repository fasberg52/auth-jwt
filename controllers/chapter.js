// chapterController.js
const { getManager } = require("typeorm");
const Chapter = require("../model/Chapter"); // Import the Chapter Entity

async function createChapter(req, res) {
  try {
    const { courseId, title } = req.body;
    const icon = req.file ? req.file.filename : null;

    const chapterRepository = getManager().getRepository(Chapter);

    const newChapter = chapterRepository.create({
      courseId,
      title,
      icon,
    });

    // Access the related course through the chapter's relationship
    if (!newChapter.courseId) {
      return res.status(400).json({ error: "دوره وجود ندارد", status: 400 });
    }

    const savedChapter = await chapterRepository.save(newChapter);

    res.status(201).json({ message: "success", savedChapter, status: 200 });
  } catch (error) {
    console.error(`Error creating chapter: ${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while creating the chapter." });
  }
}

// Rest of the code remains the same...

async function editChapter(req, res) {
  try {
    const chapterId = req.params.id;
    const { title } = req.body;
    const chapterRepository = getManager().getRepository(Chapter);


    const existingChapter = await chapterRepository.findOne({
      where: { id: chapterId },
    });

    if (!existingChapter) {
      res.status(404).json({ error: "Chapter not found.", status: 404 });
    }
    existingChapter.title = title;

    if (req.file) {
      existingChapter.icon = req.file.filename;
    }

    // Save the updated chapter
    existingChapter.lastModified = new Date();
    const updatedChapter = await chapterRepository.save(existingChapter);

    res.json({ message: "success", updatedChapter, status: 200 });
  } catch (error) {
    console.error(`Error editing chapter: ${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while editing the chapter." });
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
    res
      .status(500)
      .json({ error: "An error occurred while deleting the chapter." });
  }
}

module.exports = {
  createChapter,
  editChapter,
  deleteChapter,
};
