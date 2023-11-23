//routes/admin/admin.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const { upload } = require("../../utils/multerUtils");
const usersController = require("../../controllers/admin");
const courseController = require("../../controllers/adminCourses");
const categoryController = require("../../controllers/category");
const tagController = require("../../controllers/tag");
const orderController = require("../../controllers/order");

const { checkRole } = require("../../middleware/checkAccess");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");

router.get(
  "/users",

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

router.post("upload", jwtAuthMiddleware, checkRole("admin"));

router.post(
  "/users",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("icon"),
  categoryController.createCategory
);

// router.post(
//   "/uploads",
//   upload.single("courseImage"),
//   courseController.addCourse
// );

router.post(
  "/tag/:id/category",
  jwtAuthMiddleware,
  checkRole("admin"),
  tagController.createTag
);

router.get(
  "/tags",

  jwtAuthMiddleware,
  checkRole("admin"),
  tagController.getAllTags
);

router.get(
  "/orders",
  jwtAuthMiddleware,
  checkRole("admin"),
  orderController.getAllOrders
);

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

/**
 * @swagger
 * /admin/create-category:
 *   post:
 *     summary: Create a new category
 *     description: Create a new category with a name, description, and an optional icon.
 *     tags:
 *       - Categories
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             description:
 *               type: string
 *         example:
 *           name: "Category Name"
 *           description: "Category Description"
 *       - name: icon
 *         in: formData
 *         type: file
 *         required: false
 *         description: Category icon (optional)
 *     responses:
 *       201:
 *         description: Category created successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             savedCategory:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 icon:
 *                   type: string
 *             status:
 *               type: integer
 *         examples:
 *           success:
 *             value: { message: "success", savedCategory: { id: 1, name: "Category Name", description: "Category Description", icon: "icon_filename.jpg" }, status: 201 }
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *         examples:
 *           error:
 *             value: { error: "An error occurred while creating the category." }
 *     security:
 *       - jwt_auth: []
 *
 * securityDefinitions:
 *   jwt_auth:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 */

/**
 * @swagger
 * /admin/update-category/{categoryId}:
 *   put:
 *     summary: Update a category
 *     description: Update an existing category with a new name and description, and an optional icon.
 *     tags:
 *       - Categories
 *     consumes:
 *       - multipart/form-data
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         type: integer
 *         required: true
 *         description: ID of the category to update
 *       - in: formData
 *         name: name
 *         type: string
 *         required: true
 *         description: New name for the category
 *       - in: formData
 *         name: description
 *         type: string
 *         required: true
 *         description: New description for the category
 *       - in: formData
 *         name: icon
 *         type: file
 *         required: false
 *         description: Category icon (optional)
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             updatedCategory:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 icon:
 *                   type: string
 *             status:
 *               type: integer
 *         examples:
 *           success:
 *             value: { message: "success", updatedCategory: { id: 1, name: "Updated Category Name", description: "Updated Category Description", icon: "updated_icon.jpg" }, status: 200 }
 *       404:
 *         description: Category not found
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *             status:
 *               type: integer
 *         examples:
 *           not_found:
 *             value: { error: "Category not found.", status: 404 }
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *         examples:
 *           error:
 *             value: { error: "An error occurred while updating the category." }
 *     security:
 *       - jwt_auth: []
 *
 * securityDefinitions:
 *   jwt_auth:
 *     type: apiKey
 *     name: Authorization
 *     in: header
 */
