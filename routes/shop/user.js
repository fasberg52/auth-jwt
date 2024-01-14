const express = require("express");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const {
  getUserDataWithToken,
  getAllOrderUser,
  editDataUser,
  logoutPanel,
  createProfilePictureUpload,
} = require("../../controllers/user");
const { upload } = require("../../utils/multerUtils");

const router = express.Router();

router.post("/profile", jwtAuthMiddleware, getUserDataWithToken);
router.post("/orders", jwtAuthMiddleware, getAllOrderUser);
router.put("/profile", jwtAuthMiddleware, editDataUser);
router.post("/logout", jwtAuthMiddleware, logoutPanel);

router.post(
  "/upload-profile",
  jwtAuthMiddleware,
  upload.single("profilePicture"),
  createProfilePictureUpload
);
module.exports = router;
