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

    const existingCartCookie = req.cookies.cart;
    console.log(`cooooookie ${req.cookies.cart}`);
    let userCart = existingCartCookie
      ? JSON.parse(existingCartCookie)
      : { items: [] };

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

      res.cookie("cart", JSON.stringify(userCart), {
        httpOnly: false,
        maxAge: 900000,
       
      });

    

      return res.status(201).json({
        message: "آیتم با موفقیت اضافه شد",
        newCartItem,
        status: 201,
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

    // Deserialize cart data from the cookie
    const existingCartCookie = req.cookies.cart;
    const userCart = existingCartCookie
      ? JSON.parse(existingCartCookie)
      : { items: [] };

    const appliedCoupon = await req.cookies.appliedCoupon;

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
            const discountedPrice = appliedCoupon
              ? applyDiscount(course.price, appliedCoupon.discountPersentage)
              : course.price;
            const itemPrice = discountedPrice * cartItem.quantity;

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
    console.log(`user cartData >>>> ${cartData}`);
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

    if (!req.session.cart) {
      return res.status(404).json({ error: "سبد خرید یافت نشد" });
    }

    const courseToRemove = req.session.cart.items.find(
      (item) => item.courseId === parseInt(courseId, 10)
    );
    if (!courseToRemove) {
      return res.status(404).json({ error: "آیتم های سبد خرید پیدا نشد" });
    }

    const indexToRemove = req.session.cart.items.indexOf(courseToRemove);
    req.session.cart.items.splice(indexToRemove, 1);
    req.session.save();

    res
      .status(200)
      .json({ message: `آیتم با courseId ${courseId} از سبد خرید شما حذف شد` });
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
