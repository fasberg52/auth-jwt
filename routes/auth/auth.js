const express = require("express");
const router = express.Router();

const usersController = require("../../controllers/auth");
// const authMiddleware = require("../middleware/authMiddleware");

router.post("/login", usersController.loginUsers);
router.post("/signup", usersController.signUpUsers);
router.post("/login/verify/otp", usersController.loginWithOTP);
router.post("/login/otp", usersController.loginWithOTP);
router.post("/signup/otp");

module.exports = router;
