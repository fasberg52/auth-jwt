// controllers/cart.js

const { getManager, getConnection } = require("typeorm");
const Cart = require("../model/Cart");
const CartItems = require("../model/CartItems");
const Courses = require("../model/Course");
const Enrollment = require("../model/Enrollment");
const Coupon = require("../model/Coupon");


async function createCartItem(req, res) {
  try {
    const { courseId } = req.body;
    const userPhone = req.user.phone;
    const defaultQuantity = 1;

    // Check if a session exists, and create one if not
    if (!req.session.cart) {
      req.session.cart = { items: [] };
      req.session.save();
    }

    // Access the cart from the session
    const userCart = req.session.cart;
    console.log(`session cart ${userCart}`);
    // Check if the course is already in the cart
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

      // Add the new item to the cart
      userCart.items.push(newCartItem);
      req.session.save();

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
    const userPhone = req.user.phone;
    const connection = getConnection();
    const cartRepository = connection.getRepository(Cart);
    const cartItemsRepository = connection.getRepository(CartItems);
    const courseRepository = connection.getRepository(Courses);

    const userCart = await cartRepository.findOne({
      where: { user: { phone: userPhone } },
    });

    if (!userCart) {
      return res.status(200).json({
        cartData: [],
        totalCartPrice: 0,
        totalCartPriceCoupon: 0,
        status: 200,
      });
    }

    const cartItems = await cartItemsRepository
      .createQueryBuilder("cartItem")
      .where("cartItem.cartId = :cartId", { cartId: userCart.id })
      .getMany();

    let totalCartPrice = 0;

    const cartDataPromises = cartItems.map(async (cartItem) => {
      if (cartItem.courseId) {
        try {
          const course = await courseRepository.findOne({
            where: { id: cartItem.courseId },
          });

          if (course) {
            const discountedPrice = course.discountPrice || course.price;
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

    res
      .status(200)
      .json({ cartData, totalCartPrice, totalCartPriceCoupon, status: 200 });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function removeCartItem(req, res) {
  try {
    const { cartItemId } = req.params;

    const connection = getConnection();
    const cartItemsRepository = connection.getRepository(CartItems);

    const cartItemToRemove = await cartItemsRepository
      .createQueryBuilder("cartItem")
      .leftJoinAndSelect("cartItem.course", "course") // Assuming a relation named "course" exists in CartItems entity
      .where("cartItem.id = :cartItemId", { cartItemId })
      .getOne();

    if (!cartItemToRemove) {
      return res.status(404).json({ error: "آیتم های سبدخرید پیدا نشد" });
    }

    const courseName = cartItemToRemove.course
      ? cartItemToRemove.course.title
      : "آیتم";

    await cartItemsRepository.remove(cartItemToRemove);

    res.status(200).json({ message: `${courseName} از سبد خرید شما حذف شد` });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createCartItem,
  getUserCart,
  removeCartItem,
};
