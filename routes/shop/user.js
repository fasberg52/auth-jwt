const express = require("express");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const {
  getUserDataWithToken,
  getAllOrderUser,
  editDataUser,
} = require("../../controllers/user");
const router = express.Router();

router.post("/profile", jwtAuthMiddleware, getUserDataWithToken);
router.post("/orders", jwtAuthMiddleware, getAllOrderUser);
router.patch("/profile/edit", jwtAuthMiddleware, editDataUser);
module.exports = router;
