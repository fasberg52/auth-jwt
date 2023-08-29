const express = require("express");
const router = express.Router();

const usersController = require("../../controllers/auth");
// const authMiddleware = require("../middleware/authMiddleware");

router.post("/login", usersController.loginUsers);
router.post("/signup", usersController.signUpUsers);
router.post("/login/verify");
router.post("/signup/verify");

module.exports = router;
