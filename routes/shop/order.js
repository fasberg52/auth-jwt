const orderController = require("../../controllers/order");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const { checkRole } = require("../../middleware/checkAccess");

const express = require("express");

const router = express.Router();

router.get("/checkout", jwtAuthMiddleware, orderController.checkOutCart);
router.post("/payment-request", jwtAuthMiddleware, orderController.getPayment);
router.get("/verify-payment", orderController.verifyPayment);

module.exports = router;
