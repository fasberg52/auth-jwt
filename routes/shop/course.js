const courseController = require("../../controllers/course");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const { checkRole } = require("../../middleware/checkAccess");

const express = require("express");
const categoryController = require("../../controllers/category");
const router = express.Router();

router.get("/allcourses", courseController.getAllCourse);
router.get("/onecourse/:courseId", courseController.getProductById);

// Add an item to the cart
router.post("/cart/add/:courseId", courseController.addToCart);

// Remove an item from the cart
router.delete("/cart/remove/:courseId", courseController.removeCart);

// Get the current cart contents
router.get("/cart", courseController.getCart);

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

router.get("/checkout", courseController.getCheckout);
router.get("/payment-request", courseController.getPayment);
router.get("/check-payment", courseController.checkPayment);


router.get("/all-category", categoryController.getAllCategories)
module.exports = router;
