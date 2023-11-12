//routes/auth/auth.js
const express = require("express");
const router = express.Router();
const ajvMiddleware = require("../../middleware/ajvMiddlerware");
const usersController = require("../../controllers/auth");
const { otpRateLimiter } = require("../../config/rateLimiterConfig");
// const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/login",
  // ajvMiddleware.validateLoginUsers,
  usersController.loginUsers
);
router.post(
  "/signup",
  ajvMiddleware.validateSignUp,
  usersController.signUpUsers
);
router.post(
  "/verify/otp",

  ajvMiddleware.validateOTP,

  usersController.verifyWithOTP
);
router.post(
  "/otp",
  ajvMiddleware.validateLoginUsers,
  otpRateLimiter,
  usersController.loginWithOTP
);
router.post("/signup/otp");

module.exports = router;

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Log in a user with their credentials.
 *     tags:
 *       - Auth
 *     requestBody:
 *       description: User login credentials
 *       content:
 *         application/json:
 *     parameters:
 *       - name: phone
 *         in: query
 *         description: User phone number
 *         required: true
 *         schema:
 *           type: number
 *       - name: password
 *         in: query
 *         description: User password
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     description: Register a new user with a phone number, first name, last name, and password.
 *     tags:
 *       - Auth
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             password:
 *               type: string
 *         example:
 *           phone: "1234567890"
 *           firstName: "John"
 *           lastName: "Doe"
 *           password: "yourPasswordHere"
 *     responses:
 *       200:
 *         description: User registration successful
 *         schema:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *             username:
 *               type: string
 *         examples:
 *           success:
 *             value: { token: "yourAccessTokenHere", username: "user'sPhone" }
 *       400:
 *         description: User already exists
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *         examples:
 *           userExists:
 *             value: { error: "User already exists." }
 *       401:
 *         description: Phone number not verified
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *         examples:
 *           notVerified:
 *             value: { message: "Please verify your phone number with a one-time password." }
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *             registred:
 *               type: boolean
 *         examples:
 *           error:
 *             value: { error: "An error occurred while creating the user.", registred: true }
 */

/**
 * @swagger
 * /auth/verify/otp:
 *   post:
 *     summary: Verify OTP and log in
 *     description: Verify a one-time password (OTP) and log in the user.
 *     tags:
 *       - Auth
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             phone:
 *               type: string
 *             otp:
 *               type: string
 *         example:
 *           phone: "1234567890"
 *           otp: "yourOTPHere"
 *     responses:
 *       200:
 *         description: OTP verification successful
 *         schema:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *             username:
 *               type: string
 *         examples:
 *           success:
 *             value: { token: "yourAccessTokenHere", username: "user'sPhone" }
 *       201:
 *         description: User not found but OTP is true
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *         examples:
 *           notFound:
 *             value: { message: "user not found but OTP is true" }
 *       401:
 *         description: Invalid OTP
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *         examples:
 *           invalidOTP:
 *             value: { error: "رمز یکبار مصرف اشتباه است" }
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *         examples:
 *           error:
 *             value: { error: "An error occurred while verifying OTP" }
 */
