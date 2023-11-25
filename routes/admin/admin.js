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

router.get(
  "/order/:id",
  jwtAuthMiddleware,
  checkRole("admin"),
  orderController.getOrderById
);

module.exports = router;

