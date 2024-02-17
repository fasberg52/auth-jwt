const logger = require("../services/logger");
async function registerUser(req, res) {
  try {
    const response = quiz24.post("/registerUser", req.body);

    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error(`Error in registerUser quiz24 ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { registerUser };
