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
} = require("../../controllers/quiz");
const router = express.Router();

router.post("/registerUser", registerUser);
router.post("/users", users);
router.post("/registerStudent", registerStudent);
router.post("/students", students);
router.post("/examParticipation", examParticipation);
router.post("/examResult", examResult);

router.post("/answersheets", answersheets);
router.post("/exams", exams);
router.post("/exams", exam);
module.exports = router;
