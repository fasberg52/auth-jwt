const courseController = require("../../controllers/course");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const { checkRole } = require("../../middleware/checkAccess");

const express = require("express");
const categoryController = require("../../controllers/category");
const router = express.Router();

router.get("/allcourses", courseController.getAllCourse);
router.get("/onecourse/:courseId", courseController.getProductById);

router.post(
  "/cart/add/:courseId",
  jwtAuthMiddleware,
  courseController.addToCart
);

router.delete(
  "/cart/remove/:courseId",
  jwtAuthMiddleware,
  courseController.removeCart
);

router.get("/cart", jwtAuthMiddleware, courseController.getCart);

router.post(
  "/orders",
  jwtAuthMiddleware,

  checkRole("user"),
  courseController.placeOrder
);
router.get(
  "/orders",
  jwtAuthMiddleware,

  checkRole("user"),
  courseController.getUserOrders
);

router.get("/checkout", jwtAuthMiddleware, courseController.getCheckout);
router.get("/payment-request", jwtAuthMiddleware, courseController.getPayment);
router.get("/check-payment", courseController.checkPayment);

router.get("/all-category", categoryController.getAllCategories);
module.exports = router;
