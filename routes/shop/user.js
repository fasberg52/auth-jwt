const express = require("express");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const {
  getUserDataWithToken,
  getAllOrderUser,
  editDataUser,
  logoutPanel,
  createProfilePictureUpload,
  readPartsUserId,
  unReadPartsUserId,
  updateTeachingMethodRating,
  getReadPartId,
  countIsRead,
} = require("../../controllers/user");

const { validSubscribe } = require("../../middleware/ajvMiddlerware");

const {
  getTodayOnlineClasses,
  getFutureOnlineClasses,
} = require("../../controllers/onlineClass");
const { upload } = require("../../utils/multerUtils");
const {
  unsubscribeUser,
  subscribeUser,
  sendNotif,
} = require("../../controllers/subscribe");

const { sendNotification } = require("web-push");
//const { sendNotif } = require("../../utils/push");
const router = express.Router();

router.get("/profile", jwtAuthMiddleware, getUserDataWithToken);
router.get("/orders", jwtAuthMiddleware, getAllOrderUser);
router.put("/profile", jwtAuthMiddleware, editDataUser);
router.delete("/logout/:phone", jwtAuthMiddleware, logoutPanel);
router.post(
  "/upload-profile",
  jwtAuthMiddleware,
  upload.single("profilePicture"),
  createProfilePictureUpload
);

router.get("/today/class", jwtAuthMiddleware, getTodayOnlineClasses);
router.get("/feture/class", jwtAuthMiddleware, getFutureOnlineClasses);

router.post("/subscribe", jwtAuthMiddleware, validSubscribe, subscribeUser);

router.delete("/unsubscribe/:endpoint", jwtAuthMiddleware, unsubscribeUser);

router.get("/send-notification", sendNotif);

router.post("/read/part", jwtAuthMiddleware, readPartsUserId);
router.post("/unread/part", jwtAuthMiddleware, unReadPartsUserId);
router.post("/rating-teching", jwtAuthMiddleware, updateTeachingMethodRating);
router.get(
  "/read-part/course/:courseId/part/:partId",
  jwtAuthMiddleware,
  getReadPartId
);
router.get(
  "/read-parts/course/:courseId",
  jwtAuthMiddleware,
  countIsRead
);
module.exports = router;
