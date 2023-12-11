// chapterController.js
const { getManager } = require("typeorm");
const Chapter = require("../model/Chapter");
const Part = require("../model/Part");
const logger = require("../services/logger");
async function createChapter(req, res) {
  try {
    const { courseId, title } = req.body;

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

      orderIndex,
    });

    // Access the related course through the chapter's relationship
    if (!newChapter.courseId) {
      return res.status(400).json({ error: "دوره وجود ندارد", status: 400 });
    }

    const savedChapter = await chapterRepository.save(newChapter);
    logger.info(`message: success, ${savedChapter}, status: 201`);
    res
      .status(201)
      .json({ message: "با موفقیت ایجاد شد", savedChapter, status: 201 });
  } catch (error) {
    logger.error(`Error creating chapter: ${error}`);

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

    // Save the updated chapter
    existingChapter.lastModified = new Date();
    const updatedChapter = await chapterRepository.save(existingChapter);

    logger.info("Chapter edited", {
      chapterId,
      title,
    });
    res.json({ message: "با موفقیت تغییر کرد", updatedChapter, status: 200 });
  } catch (error) {
    logger.error(`Error editing chapter: ${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while editing the chapter." });
  }
}

async function deleteChapter(req, res) {
  try {
    const chapterRepository = getManager().getRepository(Chapter);
    const chapterId = req.params.id;

    // Fetch associated parts
    const parts = await getManager()
      .getRepository(Part)
      .createQueryBuilder("part")
      .where("part.chapterId = :chapterId", { chapterId })
      .getMany();

    await getManager().transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(Part)
        .where("chapterId = :chapterId", { chapterId })
        .execute();

      await transactionalEntityManager
        .createQueryBuilder()
        .delete()
        .from(Chapter)
        .where("id = :chapterId", { chapterId })
        .execute();
    });

    logger.info("Chapter deleted", { chapterId });
    res.status(200).json({ message: "سرفصل با موفقیت پاک شد", status:200 });
  } catch (error) {
    logger.error(`Error deleting chapter: ${error}`);
    res
      .status(500)
      .json({ error: "Internal Server Error" });
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
    logger.info("All chapters retrieved", { courseId, totalCount });

    res.json({ chapters, totalCount, status: 200 });
  } catch (error) {
    logger.error(`Error getAllChapter: ${error}`);

    res
      .status(500)
      .json({ error: "An error occurred while getAllChapter the chapter." });
  }
}
async function getChapterById(req, res) {
  try {
    const { chapterId } = req.body;
    const chapterRepository = getManager().getRepository(Chapter);
    const existingChapterId = await chapterRepository.findOne({
      where: { id: chapterId },
    });
    if (!existingChapterId) {
      res.json({ message: "این سرفصل وجود ندارد", chapterId: false });
    }
    logger.info(`Chapter retrieved by ID: ${chapterId}`, { existingChapterId });

    res.json({ existingChapterId, chapterId: true });
  } catch (error) {
    logger.error(
      `Error in  getChapterById for chapterId ${req.params.chapterId}`,
      { error }
    );
    res
      .status(500)
      .json({ error: "An error occurred while creating the getProductByIdd." });
  }
}
async function getAllChpaterWithParts(req, res) {
  try {
    const { courseId } = req.params;

    const response = await getManager()
      .createQueryBuilder(Chapter, "chapter")
      .leftJoinAndSelect("chapter.parts", "part")
      .where("chapter.courseId = :courseId", { courseId })
      .orderBy("chapter.orderIndex", "ASC")
      .select([
        "chapter.id",
        "chapter.courseId",
        "chapter.title",
        "chapter.icon",
        "chapter.orderIndex",
        "chapter.createdAt",
        "chapter.lastModified",
      ])
      .addSelect(["part.id", "part.title"])
      .getRawMany();

    const totalCount = response.length;
    const status = 200;

    res.json({ chapters: response, totalCount, status });
  } catch (error) {
    logger.error(`Error in getChpaterWithParts: ${error}`);
    res.status(500).json({
      error: "An error occurred while retrieving chapters with parts.",
    });
  }
}

module.exports = {
  createChapter,
  editChapter,
  deleteChapter,
  getAllChpters,
  getChapterById,
  getAllChpaterWithParts,
  
};
