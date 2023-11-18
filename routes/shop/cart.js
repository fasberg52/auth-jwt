const cartController = require("../../controllers/cart");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const { checkRole } = require("../../middleware/checkAccess");

const express = require("express");

const router = express.Router();
router.post("/cart/add", jwtAuthMiddleware, cartController.createCartItem);
router.get("/checkout", jwtAuthMiddleware, cartController.checkOutCart);
router.delete(
  "/cart/remove/cartItem/:cartItemId",
  jwtAuthMiddleware,
  cartController.removeCartItem
);
router.get("/cart", jwtAuthMiddleware, cartController.getUserCart);

// router.post(
//   "/orders",

//   checkRole("user"),
//   cartController.saveOrder
// );
// router.get(
//   "/orders",

//   checkRole("user"),
//   cartController.orderDetails
// );

router.post("/payment-request", jwtAuthMiddleware, cartController.getPayment);
router.get("/verify-payment", cartController.verifyPayment);

module.exports = router;
