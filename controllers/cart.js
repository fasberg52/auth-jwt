// controllers/cart.js

const Cart = require("../model/Cart");
const CartItems = require("../model/CartItems");
const Order = require("../model/Orders");
const Courses = require("../model/Course");
const User = require("../model/users");

const ZarinpalCheckout = require("zarinpal-checkout");
const { getManager, getConnection } = require("typeorm");
var zarinpal = ZarinpalCheckout.create(
  "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  true
);

async function createCartItem(req, res) {
  try {
    const { courseId, quantity } = req.body;
    const user = req.user; // Retrieve the user ID from the token
    const userPhone = req.user.phone;
    console.log(userPhone);
    const connection = getConnection();
    const cartRepository = connection.getRepository(Cart);
    const cartItemsRepository = connection.getRepository(CartItems);

    const userCart = await cartRepository.findOne({
      where: { user: { phone: userPhone } },
    });
    console.log(`>> userCart  : ${JSON.stringify(userCart)}`);
    console.log(userCart.id);

    if (!userCart) {
      const newCart = cartRepository.create({
        user: userPhone,
      });

      // Note: Do not include createdAt in the cart creation
      await cartRepository.save(newCart);

      const cartItem = cartItemsRepository.create({
        cart: newCart,
        courseId: courseId, // Set courseId here
        quantity: quantity,
      });
      await cartItemsRepository.save(cartItem);
    } else {
      const existingCartItem = await cartItemsRepository.findOne({
        where: { cart: userCart, courseId: courseId }, // Ensure courseId is set here
      });

      if (existingCartItem) {
        existingCartItem.quantity += quantity;
        await cartItemsRepository.save(existingCartItem);
      } else {
        const newCartItem = cartItemsRepository.create({
          cart: userCart,
          courseId: courseId, // Set courseId here
          quantity: quantity,
        });

        await cartItemsRepository.save(newCartItem);
      }

      res.status(200).json({ message: "Item added to cart successfully" });
    }
  } catch (error) {
    console.error(error);
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

async function checkOutCart(req, res) {
  try {
    const user = req.user;
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

    const cartItems = await cartItemsRepository.find({
      where: { cart: userCart.id },
    });

    let totalPrice = 0;

    for (const cartItem of cartItems) {
      if (cartItem.courseId) {
        const course = await courseRepository.findOne({ where: { id: cartItem.courseId } });

        if (course) {
          totalPrice += course.price * cartItem.quantity;
        }
      }
    }

    // Here, you can update the user's purchase history or perform any other actions
    // related to completing the purchase.

    res.status(200).json({ message: "Checkout successful", totalPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function saveOrder(req,res)
{

}

async function orderDetails(req,res){

}



async function getUserCart(req, res) {
  try {
    const user = req.user;
    const userPhone = req.user.phone;
    console.log("userPhone: " + userPhone);
    const connection = getConnection();
    const cartRepository = connection.getRepository(Cart);
    const cartItemsRepository = connection.getRepository(CartItems);
    const courseRepository = connection.getRepository(Courses);

    const userCart = await cartRepository.findOne({
      where: { user: { phone: userPhone } },
    });
    console.log(`>>> userCart: ${JSON.stringify(userCart)}`);
    if (!userCart) {
      return res.status(404).json({ error: "Cart not found for the user" });
    }

    const cartItems = await cartItemsRepository.find({
      where: { cart: userCart.id },
    });
    console.log(`>>> cartItems: ${JSON.stringify(cartItems)}`);

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
            return {
              courseId: course.id,
              quantity: cartItem.quantity,
              price: course.price,
              title: course.title,
            };
          }
        } catch (error) {
          console.error("Error fetching course: ", error);
        }
      }
    });

    const cartData = await Promise.all(cartDataPromises);
    console.log("Final cartData: ", cartData);
    res.status(200).json(cartData);
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function removeCartItem(cartItemId) {
  try {
    const cartRepository = getManager().getRepository(Cart);

    // Find and remove the item from the user's cart
    await cartRepository.delete(cartItemId);

    return { message: "Item removed from cart" };
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while removing from the cart");
  }
}
// async function removeCart(req, res) {
//     try {
//       const { itemId } = req.body;
//       const userPhone = req.user.phone;

//       const cartRepository = getManager().getRepository(Cart);

//       // Find and remove the item from the user's cart
//       await cartRepository.delete({ id: itemId, user: userPhone });

//       res.status(200).json({ message: "Item removed from cart" });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "An error occurred while removing from the cart" });
//     }
//   }

//   async function getCart(req, res) {
//     try {
//       const userPhone = req.user.phone;

//       const cartRepository = getManager().getRepository(Cart);

//       // Fetch the user's cart items with product details
//       const cartItems = await cartRepository.find({
//         where: { user: { phone: userPhone } }, // Assuming 'phone' is the property in your User entity
//         relations: ['course'],
//       });

//       // Extract relevant product information (name and price)
//       const cartWithProductInfo = cartItems.map((cartItem) => ({
//         id: cartItem.id,
//         product: {
//           id: cartItem.course.id,
//           name: cartItem.course.title,
//           price: cartItem.course.price,
//         },
//         quantity: cartItem.quantity,
//       }));

//       res.status(200).json({ cart: cartWithProductInfo });
//     } catch (error) {
//       console.error(error);
//       res
//         .status(500)
//         .json({ error: "An error occurred while fetching the cart" });
//     }
//   }

async function placeOrder(req, res) {
  try {
  } catch (error) {}
}

async function getUserOrders(req, res) {
  try {
  } catch (error) {}
}

async function getCheckout(req, res) {
  try {
  } catch (error) {}
}

async function getPayment(req, res) {
  try {
    const userPhone = req.user.phone;
    const response = await zarinpal.PaymentRequest({
      Amount: totalPrice,
      CallbackURL: "http://localhost:3000/course/check-payment",
      Description: "تست اتصال به درگاه پرداخت",
      metadata: { mobile: userPhone },
      Mobile: userPhone,
    });
    console.log(`>>>>>${JSON.stringify(response)}`);

    res.status(200).json(response, totalPrice);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while preparing the checkout." });
  }
}

async function checkPayment(req, res) {
  try {
    // if (!cart.length) {
    //   return res
    //     .status(400)
    //     .json({ error: "Cart is empty. Cannot proceed to checkout." });
    // }

    const user = req.user;

    const authority = req.query.Authority;

    const status = req.query.Status;

    if (status === "OK") {
      const response = await zarinpal.PaymentVerification({
        Amount: totalPrice,
        Authority: authority,
      });
      console.log(JSON.stringify(response));
      if (response.status === 100) {
        // Payment is successful, create an order and clear the cart
        const userId = req.user.phone;
        const orderRepository = getManager().getRepository(Order);

        const newOrder = orderRepository.create({
          user: userId,
          totalPrice: parseFloat(totalPrice),
          orderStatus: "success",
        });

        const savedOrder = await orderRepository.save(newOrder);

        // Clear the user's shopping cart after a successful order

        console.log("totalPrice : " + totalPrice);

        console.log("Order placed successfully. Order ID: " + savedOrder.id);

        return res
          .status(200)
          .json({ message: "Payment successful", totalPrice });
      } else {
        console.error(
          "Payment Verification Failed. Status code: " +
            response.status +
            response.message
        );

        return res.status(400).json({ error: "Payment Verification Failed" });
      }
    } else if (status === "NOK") {
      const userId = req.user.phone; // Extract user information
      const orderRepository = getManager().getRepository(Order);

      const newOrder = orderRepository.create({
        user: userId,
        totalPrice: totalPrice,
        orderStatus: "cancelled",
      });

      const savedOrder = await orderRepository.save(newOrder);

      return res.status(400).json({ error: "Payment was not successful" });
    }
  } catch (error) {
    console.error(`Payment error: ${error}`);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the payment." });
  }
}
module.exports = {
  createCartItem,
  checkOutCart,
  getUserCart,
  removeCartItem,
  placeOrder,
  getUserOrders,
  getCheckout,
  getPayment,
  checkPayment,
};
