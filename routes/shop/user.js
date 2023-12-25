const express = require("express");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const {
  getUserDataWithToken,
  getAllOrderUser,
} = require("../../controllers/user");
const router = express.Router();

router.get("/profile", jwtAuthMiddleware, getUserDataWithToken);
router.post("/orders", jwtAuthMiddleware, getAllOrderUser);
module.exports = router;
