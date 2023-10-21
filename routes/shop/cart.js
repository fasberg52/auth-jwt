const cartController = require("../../controllers/cart");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const { checkRole } = require("../../middleware/checkAccess");

const express = require("express");

const router = express.Router();
router.post("/cart/add", jwtAuthMiddleware, cartController.createCartItem);
router.post("/cart/caclulate-price", jwtAuthMiddleware, cartController.calculatePrice);
router.delete("/cart/remove", jwtAuthMiddleware, cartController.removeCartItem);
router.get("/cart", jwtAuthMiddleware, cartController.getUserCart);

router.post(
  "/orders",

  checkRole("user"),
  cartController.placeOrder
);
router.get(
  "/orders",

  checkRole("user"),
  cartController.getUserOrders
);

router.get("/checkout", jwtAuthMiddleware, cartController.getCheckout);
router.get(
  "/payment-request/:sid",
  jwtAuthMiddleware,
  cartController.getPayment
);
router.get("/check-payment", cartController.checkPayment);

module.exports = router;
