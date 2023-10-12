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
