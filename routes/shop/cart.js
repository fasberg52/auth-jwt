const cartController = require("../../controllers/cart");
const couponController = require("../../controllers/coupon");
const { jwtAuthMiddleware } = require("../../middleware/jwtMiddleware");
const express = require("express");

const router = express.Router();
router.post(
  "/cart",
  jwtAuthMiddleware,

  cartController.createCartItem
);
router.delete(
  "/cart/:courseId",
  jwtAuthMiddleware,
  cartController.removeCartItem
);
router.get(
  "/cart",
  jwtAuthMiddleware,

  cartController.getUserCart
);
router.post(
  "/cart/apply-coupon",
  jwtAuthMiddleware,
  couponController.applyCoupon
);

router.delete(
  "/cart/delete-apply-coupon/:orderId",
  jwtAuthMiddleware,
  couponController.deleteAppliedCoupon
);

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

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Operations related to the shopping cart
 */

/**
 * @swagger
 * /cart:
 *   post:
 *     summary: Add a new item to the shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: The ID of the course to add to the cart
 *               quantity:
 *                 type: integer
 *                 description: The quantity of the course to add
 *     responses:
 *       201:
 *         description: با موفقیت ثبت شد
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get the contents of the user's shopping cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: با موفیت ثبت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cartData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       courseId:
 *                         type: string
 *                         description: The ID of the course
 *                       quantity:
 *                         type: integer
 *                         description: The quantity of the course in the cart
 *                       price:
 *                         type: number
 *                         description: The price of the course
 *                       title:
 *                         type: string
 *                         description: The title of the course
 *                       itemPrice:
 *                         type: number
 *                         description: The total price for the item
 *                 totalCartPrice:
 *                   type: number
 *                   description: The total price of the entire cart
 *       404:
 *         description: سبد خرید پیدا نشد
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /cart/{cartItemId}:
 *   delete:
 *     summary: Remove an item from the shopping cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the cart item to remove
 *     responses:
 *       200:
 *         description: آیتم حذف شد
 *       404:
 *         description: سبد خرید پیدا نشد
 *       500:
 *         description: Internal server error
 */
