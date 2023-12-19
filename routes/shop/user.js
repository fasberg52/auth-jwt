const express = require("express");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const { getUserDataWithToken } = require("../../controllers/user");
const router = express.Router();

router.get("/profile", jwtAuthMiddleware, getUserDataWithToken);

module.exports = router;
