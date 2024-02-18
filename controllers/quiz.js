const logger = require("../services/logger");
const { quiz24Url } = require("../utils/axiosBaseUrl");
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
module.exports = {
  registerUser,
  users,
  registerStudent,
  students,
  examParticipation,
  examResult,
  answersheets,
  exams,
  exam,
};
