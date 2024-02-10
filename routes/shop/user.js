const express = require("express");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const {
  getUserDataWithToken,
  getAllOrderUser,
  editDataUser,
  logoutPanel,
  createProfilePictureUpload,
} = require("../../controllers/user");

const { validSubscribe } = require("../../middleware/ajvMiddlerware");

const {
  getTodayOnlineClasses,
  getFutureOnlineClasses,
} = require("../../controllers/onlineClass");
const { upload } = require("../../utils/multerUtils");
const subsController = require("../../controllers/subscribe");
const { sendNotification } = require("web-push");
//const { sendNotif } = require("../../utils/push");
const router = express.Router();

router.get("/profile", jwtAuthMiddleware, getUserDataWithToken);
router.get("/orders", jwtAuthMiddleware, getAllOrderUser);
router.put("/profile", jwtAuthMiddleware, editDataUser);
router.post("/logout", jwtAuthMiddleware, logoutPanel);
router.post(
  "/upload-profile",
  jwtAuthMiddleware,
  upload.single("profilePicture"),
  createProfilePictureUpload
);

router.get("/today/class", jwtAuthMiddleware, getTodayOnlineClasses);
router.get("/feture/class", jwtAuthMiddleware, getFutureOnlineClasses);

router.post("/subscribe", validSubscribe, subsController.subscribeUser);

router.get("/send-notification", subsController.sendNotif);

module.exports = router;
