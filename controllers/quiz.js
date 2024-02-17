const axios = require("axios");

async function testRoute(req, res) {
  try {
    const response = await axios.post(
      "https://www.quiz24.ir/api/v1/registerUser",
      req.body
    );

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { testRoute };
