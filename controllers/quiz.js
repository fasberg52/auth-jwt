const logger = require("../services/logger");
const { quiz24Url } = require("../utils/axiosBaseUrl");
async function registerUser(req, res) {
  try {
    const response = await quiz24Url.post("/registerUser", req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error(`Error in registerUser quiz24 ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function users(req, res) {
  try {
    const response = await quiz24Url.post("/users", req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error(`Error in users quiz24 ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
module.exports = { registerUser, users };
