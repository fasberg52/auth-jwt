const express = require("express");
const { registerUser } = require("../../controllers/quiz");
const router = express.Router();

router.post("/registerUser", registerUser);
module.exports = router;
