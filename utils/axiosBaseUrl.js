const axios = require("axios");
const quiz24Url = axios.create({
  baseURL: "https://www.quiz24.ir/api/v1",
  timeout: 10000,
  headers: {
    "x-api-key": process.env.X_Api_Key,
    "Content-Type": "application/json",
  },
});
module.exports = { quiz24Url };
