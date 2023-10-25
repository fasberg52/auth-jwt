// controllers/cart.js

const Cart = require("../model/Cart");
const CartItems = require("../model/CartItems");
const Order = require("../model/Orders");
const Courses = require("../model/Course");
const User = require("../model/users");

const axios = require("axios");
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
        const course = await courseRepository.findOne({
          where: { id: cartItem.courseId },
        });

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

async function saveOrder(req, res) {
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

    const cartItems = await cartItemsRepository.find({
      where: { cart: userCart.id },
    });

    let totalPrice = 0;

    for (const cartItem of cartItems) {
      if (cartItem.courseId) {
        const course = await courseRepository.findOne({
          where: { id: cartItem.courseId },
        });

        if (course) {
          totalPrice += course.price * cartItem.quantity;
        }
      }
    }

    const orderRepository = getManager().getRepository(Order);
    const newOrder = orderRepository.create({
      user: userPhone,
      totalPrice: totalPriceString,
      orderStatus: "pending",
    });
    await orderRepository.save(newOrder);

    res.status(201).json({ message: "Order placed successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while placing the order." });
  }
}

async function orderDetails(req, res) {}

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

async function getPayment(req, res) {
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

    let totalPrice = 0;

    // Calculate the total price
    const cartItems = await cartItemsRepository.find({
      where: { cart: userCart.id },
    });

    for (const cartItem of cartItems) {
      if (cartItem.courseId) {
        const course = await courseRepository.findOne({
          where: { id: cartItem.courseId },
        });

        if (course) {
          totalPrice += course.price * cartItem.quantity;
        }
      }
    }
    const totalPriceString = totalPrice.toString(); // Convert totalPrice to a string

    console.log(totalPriceString);

    const response = await zarinpal.PaymentRequest({
      Amount: totalPriceString,
      CallbackURL: "http://localhost:3000/check-payment",
      Description: "تست اتصال به درگاه پرداخت",
      metadata: { mobile: userPhone },
      Mobile: userPhone,
    });

    console.log(`>>>>>${JSON.stringify(response)}`);

    console.log(">>>>>" + totalPrice);

    // Pass totalPrice along with the response
    res.status(200).json({ response, totalPrice });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while preparing the checkout." });
  }
}

async function checkPayment(req, res, totalPriceString) {
  try {
    const { Status, Authority } = req.query;

    if (Status === "OK") {
      // Payment was successful

      const response = await zarinpal.PaymentVerification({
        Amount: totalPriceString,
        Authority: Authority,
      });

      console.log(JSON.stringify(response));

      if (response.status === 100) {
        // Payment verification succeeded
        // You can create an order and perform any other necessary actions here

        const userPhone = req.user.phone; // Extract user information
        const orderRepository = getManager().getRepository(Order);
        console.log(`refID is : ${response.RefID}`);

        // Create a new order with the user's phone number and total price
        const newOrder = orderRepository.create({
          user: userPhone,
          totalPrice: totalPriceString, // Use the calculated total price
          orderStatus: "success",
        });

        // Save the order to your database
        const savedOrder = await orderRepository.save(newOrder);

        // Clear the user's shopping cart (You can implement this function)
        await clearUserCart(userPhone);

        console.log(`Order placed successfully. Order ID: ${savedOrder.id}`);

        return res
          .status(200)
          .json({ message: "Payment successful", totalPrice });
      } else {
        console.error(
          "Payment Verification Failed. Status code: " +
            response.status +
            " - " +
            response.message
        );

        return res.status(400).json({ error: "Payment Verification Failed" });
      }
    } else if (Status === "NOK") {
      // Payment was not successful

      const userPhone = req.user.phone; // Extract user information
      const orderRepository = getManager().getRepository(Order);

      // Create a new order with the user's phone number and the total price
      const newOrder = orderRepository.create({
        user: userPhone,
        totalPrice: totalPriceString, // Use the calculated total price
        orderStatus: "cancelled",
      });

      // Save the order to your database
      const savedOrder = await orderRepository.save(newOrder);

      // Clear the user's shopping cart (You can implement this function)
      await clearUserCart(userPhone);

      return res.status(400).json({ error: "Payment was not successful" });
    } else {
      // Handle other Status values if needed
      return res.status(400).json({ error: "Invalid payment status" });
    }
  } catch (error) {
    console.error(`checkPayment error: ${error}`);
    return res
      .status(500)
      .json({ error: "An error occurred while processing the payment." });
  }
}

async function clearUserCart(userPhone) {
  const connection = getConnection();
  const cartRepository = connection.getRepository(Cart);
  const cartItemsRepository = connection.getRepository(CartItems);

  const userCart = await cartRepository.findOne({
    where: { user: { phone: userPhone } },
  });

  if (userCart) {
    // Remove the cart items associated with the user's cart
    const cartItems = await cartItemsRepository.find({
      where: { cart: userCart.id },
    });

    if (cartItems.length > 0) {
      await cartItemsRepository.remove(cartItems);
    }

    // Optionally, you can delete the user's cart as well
    await cartRepository.remove(userCart);
  }
}

module.exports = {
  createCartItem,
  checkOutCart,
  getUserCart,
  removeCartItem,
  saveOrder,
  orderDetails,
  getPayment,
  checkPayment,
};
