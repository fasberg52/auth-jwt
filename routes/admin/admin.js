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
  "/course",
  jwtAuthMiddleware,
  checkRole("admin"),
  upload.single("courseImage"),
  courseController.addCourse
);
router.put(
  "/course/:id",
  jwtAuthMiddleware,
  checkRole("admin"),
  courseController.editCourse
);
router.delete(
  "/course/:id",
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

router.get(
  "/order/:id",
  jwtAuthMiddleware,
  checkRole("admin"),
  orderController.getOrderById
);

module.exports = router;

/**
 * @swagger
 * /course:
 *   post:
 *     summary: Add a new course
 *     tags: [Admin Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the course
 *               description:
 *                 type: string
 *                 description: The description of the course
 *               price:
 *                 type: number
 *                 description: The price of the course
 *               videoUrl:
 *                 type: string
 *                 description: The URL of the course video
 *               categoryId:
 *                 type: string
 *                 description: The ID of the category for the course
 *               imageUrl:
 *                 type: string
 *                 description: The URL of the course image
 *               discountPrice:
 *                 type: number
 *                 description: The discounted price of the course
 *               discountStart:
 *                 type: string
 *                 format: date
 *                 description: The start date of the discount in Jalali calendar (YYYY-MM-DD)
 *               discountExpiration:
 *                 type: string
 *                 format: date
 *                 description: The expiration date of the discount in Jalali calendar (YYYY-MM-DD)
 *           examples:
 *             application/json:
 *               value:
 *                 title: "Example Course"
 *                 description: "This is an example course."
 *                 price: 19.99
 *                 videoUrl: "https://example.com/video"
 *                 categoryId: "exampleCategoryId"
 *                 imageUrl: "https://example.com/image"
 *                 discountPrice: 15.99
 *                 discountStart: "1400-01-01"
 *                 discountExpiration: "1400-02-01"
 *     responses:
 *       '201':
 *         description: دوره با موفقیت ایجاد شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 saveCourse:
 *                   type: object
 *                   description: The saved course information
 *                 status:
 *                   type: number
 *                   description: The HTTP status code (200)
 *       '400':
 *         description: دسته بندی پیدا نشد 
 *       '500':
 *         description: Internal server error 
 */

/**
 * @swagger
 * /course/{id}:
 *   put:
 *     summary: Edit an existing course
 *     tags: [Admin Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the course to be edited
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The updated title of the course
 *               description:
 *                 type: string
 *                 description: The updated description of the course
 *               price:
 *                 type: number
 *                 description: The updated price of the course
 *               videoUrl:
 *                 type: string
 *                 description: The updated URL of the course video
 *           examples:
 *             application/json:
 *               value:
 *                 title: "Updated Course Title"
 *                 description: "This is an updated course description."
 *                 price: 29.99
 *                 videoUrl: "https://updated-example.com/video"
 *     responses:
 *       '200':
 *         description: دوره بروز رسانی شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 editCourse:
 *                   type: object
 *                   description: The updated course information
 *       '404':
 *         description: دوره پیدا نشد
 *       '500':
 *         description: Internal server error
 */


/**
 * @swagger
 * /course/{id}:
 *   delete:
 *     summary: Delete an existing course
 *     tags: [Admin Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the course to be deleted
 *     responses:
 *       '200':
 *         description: دوره پاک شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *       '404':
 *         description: دوره پیدا نشد
 *       '500':
 *         description: Internal server error
 */
