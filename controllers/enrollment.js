//controller/enrollment.js

const { getManager } = require("typeorm");
const Part = require("../model/Part");
const Chapter = require("../model/Chapter");
const logger = require("../services/logger");

async function getAllEnrollment(req, res) {}

async function getAllEnrollmentById(req, res) {}

async function getAllChapterAndPartAfterEnroll(req, res) {
    try {
      const { courseId } = req.body;
  
      const chapterRepository = getRepository(Chapter);
      const partRepository = getRepository(Part);
  
      // Fetch chapters and parts based on courseId, you might want to add more conditions
      const chapters = await chapterRepository.find({
        where: { courseId },
        order: { orderIndex: "ASC" },
      });
  
      const parts = await partRepository.find({
        where: { courseId },
        order: { orderIndex: "ASC" },
      });
  
      // Send the list of chapters and parts to the client
      res.status(200).json({ chapters, parts });
    } catch (error) {
      logger.error(`Error in getAllChapterAndPartAfterEnroll: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  }


module.exports = {
  getAllChapterAndPartAfterEnroll,
};
