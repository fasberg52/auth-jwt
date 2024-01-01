const express = require("express");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const {
  getUserDataWithToken,
  getAllOrderUser,
  editDataUser,
  logoutPanel,
} = require("../../controllers/user");
const router = express.Router();

router.post("/profile", jwtAuthMiddleware, getUserDataWithToken);
router.post("/orders", jwtAuthMiddleware, getAllOrderUser);
router.patch("/profile", jwtAuthMiddleware, editDataUser);
router.patch("/logout", jwtAuthMiddleware, logoutPanel);
module.exports = router;
