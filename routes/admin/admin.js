//routes/admin/admin.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const upload = require("../../utils/multerUtils");
const usersController = require("../../controllers/admin");
const courseController = require("../../controllers/adminCoursesController");
const categoryController = require("../../controllers/category");
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
// admin route course
router.post(
  "/add/newcourse",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("courseImage"),
  courseController.addCourse
);
router.put(
  "/editcourse/:id",
  jwtAuthMiddleware,
  checkRole("admin"),
  courseController.editCourse
);
router.delete(
  "/deletecourse/:id",
  jwtAuthMiddleware,
  checkRole("admin"),
  courseController.deleteCourse
);

//category

router.post(
  "/create-category",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("icon"),
  categoryController.createCategory
);
router.put(
  "/update-category/:categoryId",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("icon"),
  categoryController.updateCategory
);
router.delete(
  "/delete-category/:categoryId",
  jwtAuthMiddleware,
  checkRole("admin"),

  categoryController.deleteCategory
);

// router.post(
//   "/uploads",
//   upload.single("courseImage"),
//   courseController.addCourse
// );

module.exports = router;

/**
 * @swagger
 * /admin/allusers:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users.
 *     tags:
 *       - Admin
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'  # Define the User schema in components
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/user/{phone}:
 *   get:
 *     summary: Get user by phone
 *     description: Retrieve a user by phone number.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: phone
 *         description: Phone number of the user
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - jwt: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'  # Define the User schema in components
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/update/{phone}:
 *   put:
 *     summary: Update user by phone
 *     description: Update a user's information by phone number.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: phone
 *         description: Phone number of the user
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - jwt: []
 *     requestBody:
 *       description: Updated user information
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'  # Define the User schema in components
 *     responses:
 *       200:
 *         description: User updated successfully
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
 * /admin/delete/{phone}:
 *   delete:
 *     summary: Delete user by phone
 *     description: Delete a user by phone number.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: phone
 *         description: Phone number of the user to delete
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - jwt: []
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

// Define similar Swagger documentation for the other routes: add/newcourse, editcourse, deletecourse, create-category, update-category, delete-category
