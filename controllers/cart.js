// controllers/cart.js

const { getManager, getConnection } = require("typeorm");
const Cart = require("../model/Cart");
const CartItems = require("../model/CartItems");
const Courses = require("../model/Course");
const Enrollment = require("../model/Enrollment");
const Coupon = require("../model/Coupon");
const { serialize } = require("cookie");

async function createCartItem(req, res) {
  try {
    const { courseId } = req.body;
    const userPhone = req.user.phone;
    const defaultQuantity = 1;

    let userCart = req.session.cart || { items: [] };

    const existingCartItem = userCart.items.find(
      (item) => item.courseId === courseId
    );

    if (existingCartItem) {
      return res.status(400).json({
        error: "این دوره قبلاً به سبد خرید اضافه شده است",
        status: 400,
      });
    } else {
      const newCartItem = {
        courseId: courseId,
        quantity: defaultQuantity,
      };

      userCart.items.push(newCartItem);
      req.session.cart = userCart;

      // Save the session manually
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ error: "Internal server error" });
        }

        return res.status(201).json({
          message: "آیتم با موفقیت اضافه شد",
          newCartItem,
          status: 201,
        });
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getUserCart(req, res) {
  try {
    const connection = getConnection();
    const courseRepository = connection.getRepository(Courses);

    const userCart = req.session.cart || { items: [] };

    const appliedCoupon = req.session.appliedCoupon;

    if (!userCart) {
      return res.status(200).json({
        cartData: [],
        totalCartPrice: 0,
        totalCartPriceCoupon: 0,
        status: 200,
      });
    }

    let totalCartPrice = 0;

    const cartDataPromises = userCart.items.map(async (cartItem) => {
      if (cartItem.courseId) {
        try {
          const course = await courseRepository.findOne({
            where: { id: cartItem.courseId },
          });

          if (course) {
            const discountedPrice = course.discountPrice;

            const itemPrice =
              discountedPrice !== null
                ? discountedPrice * cartItem.quantity
                : course.price * cartItem.quantity;

            totalCartPrice += itemPrice;

            return {
              cartItemId: cartItem.id,
              courseId: course.id,
              imageUrl: course.imageUrl,
              quantity: cartItem.quantity,
              price: course.price,
              discountPrice: discountedPrice,
              title: course.title,
              itemPrice,
            };
          }
        } catch (error) {
          console.error("Error processing cart item:", error);
        }
      }
    });

    const cartData = await Promise.all(cartDataPromises);

    let totalCartPriceCoupon = totalCartPrice;

    return res
      .status(200)
      .json({ cartData, totalCartPrice, totalCartPriceCoupon, status: 200 });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
function applyDiscount(originalPrice, discountPercentage) {
  const discountAmount = (discountPercentage / 100) * originalPrice;
  const discountedPrice = originalPrice - discountAmount;
  return discountedPrice;
}

async function removeCartItem(req, res) {
  try {
    const { courseId } = req.params;
    console.log(` req.session.cart >> ${JSON.stringify(req.session.cart)}`);

    console.log(courseId);
    if (!req.session.cart) {
      return res.status(404).json({ error: "سبد خرید یافت نشد" });
    }

    const courseToRemove = req.session.cart.items.find((item) => {
      console.log(item);
      return parseInt(item.courseId) === parseInt(courseId, 10);
    });
    console.log(` req.session.cart >> ${JSON.stringify(req.session.cart)}`);

    console.log(`courseToRemove >> ${JSON.stringify(courseToRemove)}`);
    if (!courseToRemove) {
      return res.status(404).json({ error: "آیتم های سبد خرید پیدا نشد" });
    }

    const indexToRemove = req.session.cart.items.indexOf(courseToRemove);
    req.session.cart.items.splice(indexToRemove, 1);
    req.session.save();

    res.status(200).json({ message: `دوره از سبد شما حذف شد` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createCartItem,
  getUserCart,
  removeCartItem,
};
