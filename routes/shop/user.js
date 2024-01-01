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
router.put("/profile", jwtAuthMiddleware, editDataUser);
router.post("/logout", jwtAuthMiddleware, logoutPanel);
module.exports = router;
