//routes/auth/auth.js
const express = require("express");
const router = express.Router();
const ajvMiddleware = require("../../middleware/ajvMiddlerware");
const usersController = require("../../controllers/auth");
// const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/login",
  ajvMiddleware.validateLoginUsers,
  usersController.loginUsers
);
router.post("/signup", usersController.signUpUsers);
router.post("/login/verify/otp", usersController.verifyWithOTP);
router.post("/login/otp", usersController.loginWithOTP);
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
 *     summary: User signup
 *     description: Sign up a new user.
 *     tags:
 *       - Auth
 *     requestBody:
 *       description: User signup information
 *       content:
 *         application/json:
 *     parameters:
 *       - name: firstName
 *         in: query
 *         description: User's first name
 *         required: true
 *         schema:
 *           type: string
 *       - name: lastName
 *         in: query
 *         description: User's last name
 *         required: true
 *         schema:
 *           type: string
 *       - name: phone
 *         in: query
 *         description: User's phone number
 *         required: true
 *         schema:
 *           type: number
 *       - name: password
 *         in: query
 *         description: User's password
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 */
/**
 * @swagger
 * /auth/login/verify/otp:
 *   post:
 *     summary: Verify user login with OTP
 *     description: Verify a user's login with OTP.
 *     tags:
 *       - Auth
 *     requestBody:
 *       description: OTP verification information
 *       content:
 *         application/json:
 *     parameters:
 *       - name: phone
 *         in: query
 *         description: User's phone number
 *         required: true
 *         schema:
 *           type: number
 *       - name: otp
 *         in: query
 *         description: OTP sent to the user's phone
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: OTP verification successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'  # Define the User schema in components
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /auth/login/otp:
 *   post:
 *     summary: User login with OTP
 *     description: Log in a user with OTP.
 *     tags:
 *       - Auth
 *     requestBody:
 *       parameters:
 *       - name: phone
 *         in: query
 *         description: User's phone number
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: OTP login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'  # Define the User schema in components
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Phone number not found
 *       500:
 *         description: An error occurred while logging in with OTP
 */

/**
 * @swagger
 * /auth/signup/otp:
 *   post:
 *     summary: Send OTP for signup
 *     description: Send OTP for user signup.
 *     tags:
 *       - Auth
 *     requestBody:
 *       description: User phone number for OTP
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 */
