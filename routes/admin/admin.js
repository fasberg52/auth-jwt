const express = require("express");
const router = express.Router();
const passport = require("passport");
const usersController = require("../../controllers/admin");
const { checkRole } = require("../../middleware/checkAccess");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
router.get(
  "/allusers",

  jwtAuthMiddleware,
  checkRole("admin"),
  usersController.getUsers
);
router.get(
  "/user/:phone",
  jwtAuthMiddleware,
  checkRole("admin"),
  usersController.getUserByPhone
);

router.put(
  "/update/:phone",
  jwtAuthMiddleware,
  checkRole("admin"),
  usersController.updateUsers
);
router.delete(
  "/delete/:phone",
  jwtAuthMiddleware,
  checkRole("admin"),
  usersController.deleteUsers
);

module.exports = router;
