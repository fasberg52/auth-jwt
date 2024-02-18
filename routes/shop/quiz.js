const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const { checkRole } = require("../../middleware/checkAccess");

const express = require("express");

const {
  registerUser,
  users,
  registerStudent,
  students,
  examParticipation,
  examResult,
  answersheets,
  exams,
  exam,
  examCode,
} = require("../../controllers/quiz");
const router = express.Router();

router.post("/registerUser", jwtAuthMiddleware, registerUser);
router.post("/users", jwtAuthMiddleware, users);
router.post("/registerStudent", registerStudent);
router.post("/students", jwtAuthMiddleware, students);
router.post("/examParticipation", jwtAuthMiddleware, examParticipation);
router.post("/examResult", jwtAuthMiddleware, examResult);

router.post("/answersheets", jwtAuthMiddleware, answersheets);
router.post("/exams", jwtAuthMiddleware, exams);
router.post("/exam", jwtAuthMiddleware, exam);

router.post("/examCode", jwtAuthMiddleware, checkRole("admin"), examCode);
module.exports = router;
