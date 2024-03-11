const logger = require("../services/logger");
const Quiz = require("../model/quiz");
const { getRepository } = require("typeorm");
const { quiz24Url } = require("../utils/axiosBaseUrl");
const { getRounds } = require("bcryptjs");
const Enrollment = require("../model/Enrollment");

async function registerUser(req, res) {
  try {
    const userId = process.env.ADMIN_QUEZ24;
    const requestBody = { ...req.body, userId };
    const response = await quiz24Url.post("/registerUser", requestBody);
    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error(`Error in registerUser quiz24 ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function registerStudent(req, res) {
  try {
    const userId = process.env.ADMIN_QUEZ24;
    const requestBody = { ...req.body, userId };
    const response = await quiz24Url.post("/registerStudent", requestBody);
    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error(`Error in registerStudent quiz24 ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function users(req, res) {
  try {
    const userId = process.env.ADMIN_QUEZ24;
    const requestBody = { ...req.body, userId };
    const response = await quiz24Url.post("/users", requestBody);
    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error(`Error in users quiz24 ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function students(req, res) {
  try {
    const userId = process.env.ADMIN_QUEZ24;
    const requestBody = { ...req.body, userId };
    const response = await quiz24Url.post("/students", requestBody);
    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error(`Error in students quiz24 ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function examParticipation(req, res) {
  try {
    const userId = process.env.ADMIN_QUEZ24;
    const requestBody = { ...req.body, userId };
    const response = await quiz24Url.post("/examParticipation", requestBody);
    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error(`Error in examParticipation quiz24 ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function examResult(req, res) {
  try {
    const userId = process.env.ADMIN_QUEZ24;
    const requestBody = { ...req.body, userId };
    const response = await quiz24Url.post("/examResult", requestBody);
    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error(`Error in examResult quiz24 ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function answersheets(req, res) {
  try {
    const userId = process.env.ADMIN_QUEZ24;
    const requestBody = { ...req.body, userId };
    const response = await quiz24Url.post("/answersheets", requestBody);
    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error(`Error in answersheets quiz24 ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function exams(req, res) {
  try {
    const userId = process.env.ADMIN_QUEZ24;
    const requestBody = { ...req.body, userId };
    const response = await quiz24Url.post("/exams", requestBody);
    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error(`Error in exams quiz24 ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function exam(req, res) {
  try {
    const userId = process.env.ADMIN_QUEZ24;
    const requestBody = { ...req.body, userId };
    const response = await quiz24Url.post("/exam", requestBody);
    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error(`Error in exam quiz24 ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
async function createExamCode(req, res) {
  try {
    const { examCode, examTitle, examPrice, start, end, expireTime } = req.body;
    const quizRepository = getRepository(Quiz);
    const exitingCode = await quizRepository.findOne({
      where: { examCode: examCode },
    });
    if (exitingCode) {
      res.status(400).json({ error: "این کد از قبل وجود دارد", status: 400 });
    }
    const newExamCode = quizRepository.create({
      examCode: examCode,
      examTitle: examTitle,
      examPrice: examPrice,
      start: start,
      end: end,
      expireTime: expireTime,
    });
    await quizRepository.save(newExamCode);
    res.status(201).json({ message: "با موفقیت ساخته شد", status: 201 });
  } catch (error) {
    logger.error(`Error in ExamCode ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllExamCodes(req, res) {
  try {
    const userPhone = req.user.phone;

    const enrollmentRepository = getRepository(Enrollment);

    const isEnrolled = await enrollmentRepository
      .createQueryBuilder("enrollment")
      .innerJoin("enrollment.quiz", "quiz")
      .innerJoin("enrollment.order", "o")
      .innerJoin("o.user", "user")
      .where("user.phone = :phone", { phone: userPhone })
      .andWhere("o.orderStatus = :orderStatus", { orderStatus: "success" })
      .getCount();

    const examCodeRepository = getRepository(Quiz);
    const examCodes = await examCodeRepository.find();

    if (!isEnrolled) {
      res.json({ access: false, examCodes: examCodes, status: 200 });
    } else {
      res.json({ access: true, examCodes: examCodes, status: 200 });
    }
  } catch (error) {
    logger.error(`Error in getAllExamCodes ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// async function getAllExamCodes(req, res) {
//   try {
//     const examCodeRepository = getRepository(Quiz);
//     const examCodes = await examCodeRepository.find();

//     res.status(200).json({ examCodes: examCodes, status: 200 });
//   } catch (error) {
//     logger.error(`Error in getAllExamCodes ${error}`);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }

async function getExamCodeById(req, res) {
  try {
    const examCodeId = req.params.examCodeId;
    const examCodeRepository = getRepository(Quiz);
    const examCode = await examCodeRepository.findOne({
      where: { id: examCodeId },
    });

    if (!examCode) {
      return res.status(404).json({ error: "کد آزمون پیدا نشد!", status: 404 });
    }

    res.status(200).json({ examCode: examCode, status: 200 });
  } catch (error) {
    logger.error(`Error in getExamCodeById ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateExamCode(req, res) {
  try {
    const examCodeId = req.params.examCodeId;
    const { examCode, examTitle, examPrice, start, end, expireTime } = req.body;
    const examCodeRepository = getRepository(Quiz);

    const existingExamCode = await examCodeRepository.findOne({
      where: { id: examCodeId },
    });

    if (!existingExamCode) {
      return res.status(404).json({ error: "کد ازمون پیدا نشد", status: 404 });
    }

    existingExamCode.examCode = examCode;
    existingExamCode.examTitle = examTitle;
    existingExamCode.examPrice = examPrice;
    existingExamCode.start = start;
    existingExamCode.end = end;
    existingExamCode.expireTime = expireTime;
    await examCodeRepository.save(existingExamCode);

    res
      .status(200)
      .json({ message: "کد آزمون با موفقیت آپدیت شد", status: 200 });
  } catch (error) {
    logger.error(`Error in updateExamCode ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteExamCode(req, res) {
  try {
    const examCodeId = req.params.examCodeId;
    const examCodeRepository = getRepository(Quiz);

    const existingExam = await examCodeRepository.findOne({
      where: { id: examCodeId },
    });

    if (!existingExam) {
      return res.status(404).json({ error: "کد آزمون پیدا نشد!", status: 404 });
    }

    await examCodeRepository.delete(examCodeId);

    res.status(200).json({ message: "کد آزمون با موفقیت پاک شد", status: 200 });
  } catch (error) {
    logger.error(`Error in deleteExamCode ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const getEnrolledQuizzesForUser = async (req, res) => {
  try {
    const userPhone = req.user.phone;

    const enrollmentRepository = getRepository(Enrollment);

    const enrolledQuizzesQuery = enrollmentRepository
      .createQueryBuilder("enrollment")
      .leftJoinAndSelect("enrollment.quiz", "quiz")
      .leftJoin("enrollment.order", "o")
      .leftJoin("o.user", "user")
      .where("user.phone = :phone", { phone: userPhone })
      .andWhere("o.orderStatus = :orderStatus", { orderStatus: "success" })
      .select([
        "quiz.id as id",
        "quiz.examCode as examCode",
        "quiz.examTitle as examTitle",
        "quiz.examPrice as examPrice",
        "quiz.start as start",
        "quiz.end as end",
        "quiz.expireTime as expireTime",
        "quiz.itemType as itemType",
      ]);

    const enrolledQuizzes = await enrolledQuizzesQuery.getRawMany();

    res.status(200).json({
      enrolledQuizzes: enrolledQuizzes,
      status: 200,
    });
  } catch (error) {
    console.error(`Error in getEnrolledQuizzesForUser: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllExamCodes,
  updateExamCode,
  getExamCodeById,
  createExamCode,
  deleteExamCode,
  registerUser,
  users,
  registerStudent,
  students,
  examParticipation,
  examResult,
  answersheets,
  exams,
  exam,
  getEnrolledQuizzesForUser,
};
