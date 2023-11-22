// controllers/cart.js

const { getManager, getConnection } = require("typeorm");
const Cart = require("../model/Cart");
const CartItems = require("../model/CartItems");
const Courses = require("../model/Course");
const Order = require("../model/Orders");
const OrderItems = require("../model/orderItems");
const axios = require("axios");

const ZARINPAL_API = "https://api.zarinpal.com/pg/v4/payment/request.json";
const ZARINPAL_VERIFICATION_API =
  "https://api.zarinpal.com/pg/v4/payment/verify.json";

// var zarinpal = ZarinpalCheckout.create(
//   "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
//   true
// );

async function createCartItem(req, res) {
  try {
    const { courseId, quantity } = req.body;
    const userPhone = req.user.phone;

    const connection = getConnection();
    const cartRepository = connection.getRepository(Cart);
    const cartItemsRepository = connection.getRepository(CartItems);

    let userCart = await cartRepository.findOne({
      where: { user: { phone: userPhone } },
    });

    if (!userCart) {
      userCart = cartRepository.create({
        user: userPhone,
      });
      await cartRepository.save(userCart);
    }
    console.log(`userCart.id before findOne: ${userCart.id}`);

    const existingCartItem = await cartItemsRepository
      .createQueryBuilder("cartItem")
      .where("cartItem.cartId = :cartId", { cartId: userCart.id })
      .andWhere("cartItem.courseId = :courseId", { courseId: courseId })
      .getOne();
    console.log(
      `existingCartItem > >  > > > > ${JSON.stringify(existingCartItem)}`
    );
    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await cartItemsRepository.save(existingCartItem);
    } else {
      const newCartItem = cartItemsRepository.create({
        cart: userCart,
        courseId: courseId,
        quantity: quantity,
      });
      await cartItemsRepository.save(newCartItem);
    }

    res.status(200).json({ message: "Item added to cart successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
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
      return res.status(404).json({ error: "Cart not found for the user" });
    }

    const cartItems = await cartItemsRepository
      .createQueryBuilder("cartItem")
      .where("cartItem.cartId = :cartId", { cartId: userCart.id })
      .getMany();

    let totalCartPrice = 0;

    const cartDataPromises = cartItems.map(async (cartItem) => {
      console.log("Processing cartItem: ", cartItem);
      if (cartItem.courseId) {
        console.log("Course data exists for cartItem: ", cartItem.courseId);
        try {
          const course = await courseRepository.findOne({
            where: { id: cartItem.courseId },
          });
          console.log("Fetched course data: ", course);
          if (course) {
            // Calculate discounted price if applicable
            const discountedPrice = course.discountPrice || course.price;
            const itemPrice = discountedPrice * cartItem.quantity;

            // Accumulate the total price
            totalCartPrice += itemPrice;

            return {
              courseId: course.id,
              quantity: cartItem.quantity,
              price: discountedPrice,
              title: course.title,
              itemPrice,
            };
          }
        } catch (error) {
          console.error("Error fetching course: ", error);
        }
      }
    });

    const cartData = await Promise.all(cartDataPromises);
    console.log("Final cartData: ", cartData);

    res.status(200).json({ cartData, totalCartPrice });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// async function checkOutCart(req, res) {
//   try {
//     const user = req.user; // Retrieve user information from the request

//     const connection = getConnection();
//     const cartRepository = connection.getRepository(Cart);
//     const cartItemsRepository = connection.getRepository(CartItems);

//     // Find the user's shopping cart
//     const userCart = await cartRepository.findOne({
//       where: { user: user },
//     });

//     if (!userCart) {
//       return res.status(404).json({ error: "Cart not found for the user" });
//     }

//     // Find cart items
//     const cartItems = await cartItemsRepository.find({
//       where: { cart: userCart },
//     });

//     let totalPrice = 0;

//     // Create purchase history records and calculate total price
//     for (const cartItem of cartItems) {
//       // const purchaseHistoryItem = purchaseHistoryRepository.create({
//       //   user: user,
//       //   courseId: cartItem.courseId,
//       //   quantity: cartItem.quantity,
//       // });

//       // Calculate and accumulate the total price
//       totalPrice += cartItem.price * cartItem.quantity;

//       // await purchaseHistoryRepository.save(purchaseHistoryItem);
//     }

//     // Clear the shopping cart
//     await cartItemsRepository.remove(cartItems);

//     res
//       .status(200)
//       .json({ message: "Checkout completed successfully", totalPrice });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }


// async function saveOrder(req, res) {
//   try {
//     const userPhone = req.user.phone;
//     const connection = getConnection();
//     const cartRepository = connection.getRepository(Cart);
//     const cartItemsRepository = connection.getRepository(CartItems);
//     const courseRepository = connection.getRepository(Courses);

//     const userCart = await cartRepository.findOne({
//       where: { user: { phone: userPhone } },
//     });

//     if (!userCart) {
//       return res.status(404).json({ error: "Cart not found for the user" });
//     }

//     const cartItems = await cartItemsRepository.find({
//       where: { cart: userCart.id },
//     });

//     let totalPrice = 0;

//     for (const cartItem of cartItems) {
//       if (cartItem.courseId) {
//         const course = await courseRepository.findOne({
//           where: { id: cartItem.courseId },
//         });

//         if (course) {
//           totalPrice += course.price * cartItem.quantity;
//         }
//       }
//     }

//     const orderRepository = getManager().getRepository(Order);
//     const newOrder = orderRepository.create({
//       user: userPhone,
//       totalPrice: totalPrice,
//       orderStatus: "pending",
//     });
//     await orderRepository.save(newOrder);

//     res.status(201).json({ message: "Order placed successfully." });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while placing the order." });
//   }
// }

// async function orderDetails(req, res) {}

async function removeCartItem(req, res) {
  try {
    const { cartItemId } = req.params; // Assuming you're passing cartItemId as a route parameter

    const connection = getConnection();
    const cartItemsRepository = connection.getRepository(CartItems);

    const cartItemToRemove = await cartItemsRepository.findOne({
      where: { id: cartItemId },
    });

    if (!cartItemToRemove) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await cartItemsRepository.remove(cartItemToRemove);

    res.status(200).json({ message: "Cart item removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}



module.exports = {
  createCartItem,
  getUserCart,
  removeCartItem,
  // saveOrder,
  // orderDetails,
  
};
