// controllers/cart.js

const Cart = require("../model/Cart");
const Order = require("../model/Orders");
const Courses = require("../model/Course");
const User = require("../model/users");
const ZarinpalCheckout = require("zarinpal-checkout");
const { getManager } = require("typeorm");
var zarinpal = ZarinpalCheckout.create(
  "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  true
);
async function createCartItem(req, res) {
  const { courseId } = req.body; // Get user ID and course ID from the request
  const userPhone = req.user.phone;
  try {
    // Check if the product already exists in the cart
    const userRepository = getManager().getRepository(User);
    const user = await userRepository.findOne({ where: { phone: userPhone } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const cartRepository = getManager().getRepository(Cart);
    const existingCartItem = await cartRepository.findOne({
      where: { user: user, course: courseId },
    });

    if (existingCartItem) {
      // If it exists, increment the quantity
      existingCartItem.quantity += 1;
      await cartRepository.save(existingCartItem); // Save the existingCartItem
    } else {
      // If it doesn't exist, create a new cart item
      const courseRepository = getManager().getRepository(Courses);
      const course = await courseRepository.findOne({ where: { id: courseId } });

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      const newCartItem = cartRepository.create({
        user: user,
        course: course,
        quantity: 1,
      });
      await cartRepository.save(newCartItem); // Save the newCartItem
    }

    res.status(200).json({ message: "Product added to the cart" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error from createCart" });
  }
}

async function calculatePrice(req, res) {
  const userPhone = req.user.phone;

  try {
    // Find the user based on their phone number
    const userRepository = getManager().getRepository(User);
    const user = await userRepository.findOne({ where: { phone: userPhone } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the cart items for the user
    const cartRepository = getManager().getRepository(Cart);
    const cartItems = await cartRepository.find({
      where: { user: user },
      relations: ["course"], // Ensure you load the 'course' relation
    });

    let totalPrice = 0;

    for (const cartItem of cartItems) {
      // Calculate price for products added 2 or more times
      if (cartItem.quantity >= 2) {
        totalPrice += cartItem.quantity * cartItem.course.price;
      }
    }

    res.status(200).json({ totalPrice });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Internal Server Error from calculatePrice" });
  }
}

async function updateCartItemQuantity(cartItemId, newQuantity) {
  try {
    const cartRepository = getManager().getRepository(Cart);

    const cartItem = await cartRepository.findOne(cartItemId);

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    cartItem.quantity = newQuantity;
    await cartRepository.save(cartItem);

    return { message: "Cart item quantity updated" };
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while updating cart item quantity");
  }
}
async function getUserCart(req, res) {
  try {
    const cartRepository = getManager().getRepository(Cart);
    const user = req.user;

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    // Fetch the user's cart items with product details
    const cartItems = await cartRepository.find({
      where: { user: user },
      relations: ["course"], // Assuming you have a 'course' relation in your Cart entity
    });
    // Extract relevant product information (name and price)
    const cartWithProductInfo = cartItems.map((cartItem) => ({
      id: cartItem.id,
      product: {
        id: cartItem.course.id,
        name: cartItem.course.title, // Make sure 'name' matches your Course entity property
        price: cartItem.course.price, // Make sure 'price' matches your Course entity property
      },
      quantity: cartItem.quantity,
    }));
    res.status(200).json({ cart: cartWithProductInfo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error on getUserCart" });
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
  updateCartItemQuantity,
  calculatePrice,
  getUserCart,
  removeCartItem,
  placeOrder,
  getUserOrders,
  getCheckout,
  getPayment,
  checkPayment,
};
