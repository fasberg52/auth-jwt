// chapterController.js
const { getManager } = require("typeorm");
const Chapter = require("../model/Chapter"); // Import the Chapter Entity
async function createChapter(req, res) {
  try {
    const { courseId, title } = req.body;
    const icon = req.file ? req.file.filename : null;

    const chapterRepository = getManager().getRepository(Chapter);

    const [result] = await chapterRepository.query(
      'SELECT COUNT(*) FROM chapters WHERE "courseId" = $1',
      [courseId]
    );

    const chapterCount = parseInt(result.count);

    console.log(`>> chapterCount ${chapterCount}`);
    // Step 2: Set the orderIndex for the new chapter to the current chapterCount
    const orderIndex = chapterCount;
    console.log(`>> orderIndex ${orderIndex}`);

    const newChapter = chapterRepository.create({
      courseId,
      title,
      icon,
      orderIndex,
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

async function getAllChpters(req, res) {
  try {
    const { courseId } = req.params;
    const chapterRepository = getManager().getRepository(Chapter);

    const chapters = await chapterRepository.find({
      where: { courseId: courseId },

      order: {
        orderIndex: "ASC",
      },
    });
    const totalCount = chapters.length;
    console.log("Chapters:", chapters); // Add this line for logging

    res.json({ chapters, totalCount, status: 200 });
  } catch (error) {
    console.error(`Error getAllChapter : ${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while getAllChapter the chapter." });
  }
}
async function getChapterById(req, res) {
  const { chapterId } = req.body;
  const chapterRepository = getManager().getRepository(Chapter);
  const existingChapterId = await chapterRepository.findOne({
    where: { id: chapterId },
  });
  if (!existingChapterId) {
    res.json({ message: "این سرفصل وجود ندارد", chapterId: false });
  }
  res.json({ existingChapterId, chapterId: true });
}

module.exports = {
  createChapter,
  editChapter,
  deleteChapter,
  getAllChpters,
  getChapterById,
};
