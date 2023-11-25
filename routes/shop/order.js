const orderController = require("../../controllers/order");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const { checkRole } = require("../../middleware/checkAccess");

const express = require("express");

const router = express.Router();

router.get("/checkout", jwtAuthMiddleware, orderController.checkOutCart);
router.post(
  "/payment-request",
  jwtAuthMiddleware,
  orderController.createPayment
);
router.get("/payment-verify", orderController.verifyPayment);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Operations related to orders
 */

/**
 * @swagger
 * /checkout:
 *   get:
 *     summary: Proceed to checkout and calculate total price
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checkout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 totalPrice:
 *                   type: number
 *                   description: The total price of the order
 *       404:
 *         description: Cart not found for the user
 *       500:
 *         description: Internal server error on checkout
 */

/**
 * @swagger
 * /payment-request:
 *   post:
 *     summary: Create a payment request and initiate payment process
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentUrl:
 *                   type: string
 *                   description: The URL to redirect the user for payment
 *                 updatedTotalPrice:
 *                   type: number
 *                   description: The updated total price after payment
 *                 cartId:
 *                   type: string
 *                   description: The ID of the user's cart
 *                 savedOrder:
 *                   type: object
 *                   description: The saved order information
 *       400:
 *         description: Payment Request Failed
 *       404:
 *         description: Cart not found for the user
 *       500:
 *         description: An error occurred while preparing the createPayment
 */

/**
 * @swagger
 * /payment-verify:
 *   get:
 *     summary: Verify payment status after redirection from the payment gateway
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: Authority
 *         schema:
 *           type: string
 *         required: true
 *         description: The authority received from the payment gateway
 *       - in: query
 *         name: Status
 *         schema:
 *           type: string
 *         required: true
 *         description: The status of the payment (OK or NOK)
 *       - in: query
 *         name: Amount
 *         schema:
 *           type: string
 *         required: true
 *         description: The amount of the payment
 *       - in: query
 *         name: OrderId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the order
 *       - in: query
 *         name: Phone
 *         schema:
 *           type: string
 *         required: false
 *         description: The phone number associated with the order
 *     responses:
 *       200:
 *         description: Payment verification succeeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 updateOrder:
 *                   type: object
 *                   description: The updated order information
 *       400:
 *         description: Invalid order or order is not pending (for NOK status)
 *       500:
 *         description: An error occurred while processing the payment verification
 */
