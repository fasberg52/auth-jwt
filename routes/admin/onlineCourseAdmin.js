const express = require("express");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const ajvMiddlerware = require("../../middleware/ajvMiddlerware");
const { checkRole } = require("../../middleware/checkAccess");
const {
  createOnlineClass,
  updateOnlineClass,
} = require("../../controllers/onlineClass");
const router = express.Router();

router.post(
  "/online-course",
  jwtAuthMiddleware,
  checkRole("admin"),
  createOnlineClass
);

module.exports = router;
