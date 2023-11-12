// controllers/cart.js

const Cart = require("../model/Cart");
const CartItems = require("../model/CartItems");
const Order = require("../model/Orders");
const Courses = require("../model/Course");
const User = require("../model/users");

const axios = require("axios");
const { getManager, getConnection } = require("typeorm");

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
    .createQueryBuilder('cartItem')
    .where('cartItem.cartId = :cartId', { cartId: userCart.id })
    .andWhere('cartItem.courseId = :courseId', { courseId: courseId })
    .getOne();
    console.log(`existingCartItem > >  > > > > ${JSON.stringify(existingCartItem)}`)
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
    const user = req.user;
    console.log(user);

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

    const cartItems = await cartItemsRepository
      .createQueryBuilder("cartItem")
      .where("cartItem.cartId = :cartId", { cartId: userCart.id })
      .getMany();

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
      totalPrice: totalPrice,
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

async function getPayment(req, res) {
  try {
    console.log("req is : " + req);
    const userPhone = req.user.phone;
    const connection = getConnection();
    const cartRepository = connection.getRepository(Cart);
    const cartItemsRepository = connection.getRepository(CartItems);
    const courseRepository = connection.getRepository(Courses);

    const userCart = await cartRepository.findOne({
      where: { user: { phone: userPhone } },
    });
    console.log(userCart);
    if (!userCart) {
      return res.status(404).json({ error: "Cart not found for the user" });
    }

    // Calculate the total price
    let totalPrice = 0;

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

    // Convert totalPrice to a string

    // Replace with your Zarinpal merchant_id

    const callbackUrl =
      "http://localhost:3000/verify-payment?" + `Amount=${totalPrice}`; // Replace with your callback URL
    const description = "Transaction description.";
    const mobile = userPhone;

    // Construct the request data
    const requestData = JSON.stringify({
      merchant_id: process.env.MERCHANT_ID,
      amount: totalPrice,
      callback_url: callbackUrl,
      description: description,
      metadata: {
        mobile: mobile,
      },
    });
    // console.log(requestData.metadata.mobile);
    // Send a POST request to Zarinpal's payment request endpoint
    const response = await axios.post(
      "https://api.zarinpal.com/pg/v4/payment/request.json",
      requestData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`Response from Zarinpal: ${JSON.stringify(response.data)}`);

    // Extract the authority code from the response (you may need to adjust this based on Zarinpal's response structure)
    const code = response.data.data.code;
    console.log(`code is : ${code}`);
    if (code == 100) {
      // Payment request succeeded
      const authority = response.data.data.authority;
      const paymentUrl = `https://www.zarinpal.com/pg/StartPay/${authority}`;

      res.json({ paymentUrl, totalPrice });
    } else {
      // Payment request failed
      return res.status(400).json({ error: "Payment Request Failed" });
    }
  } catch (error) {
    console.error(`getPayment error: ${error.message}`);
    res
      .status(500)
      .json({ error: "An error occurred while preparing the getPayment." });
  }
}

async function verifyPayment(req, res) {
  try {
    const { Authority, Status, Amount } = req.query;

    console.log("query", req.query);

    if (Status === "OK") {
      // Payment was successful
      const amount = Amount;

      // Replace with your Zarinpal merchant_id
      const merchant_id = process.env.MERCHANT_ID;

      // Construct the request data for verification
      const verificationData = JSON.stringify({
        merchant_id: merchant_id,
        authority: Authority,
        amount: amount,
      });

      const response = await axios.post(
        "https://api.zarinpal.com/pg/v4/payment/verify.json",
        verificationData,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`response verify : ${JSON.stringify(response.data)}`);
      const code = response.data.data.code;

      if (code == 100) {
        // Payment verification succeeded
        const refID = response.data.data.ref_id;

        // You can create an order and perform any other necessary actions here
        const orderRepository = getManager().getRepository(Order);

        // Create a new order with the user's phone number and total price
        const newOrder = orderRepository.create({
          totalPrice: amount, // Use the amount from the verification
          orderStatus: "success",
          refID: refID, // Store the reference ID
        });

        console.log(JSON.stringify(newOrder));
        // Save the order to your database
        const savedOrder = await orderRepository.save(newOrder);

        console.log(`savedOrder ${JSON.stringify(saveOrder)}`);
        // Clear the user's shopping cart (You can implement this function)
        await clearUserCart(userPhone);

        console.log(`Order placed successfully. Order ID: ${savedOrder.id}`);

        return res
          .status(200)
          .json({ message: "Payment verification succeeded", refID });
      } else {
        console.error(
          "Payment Verification Failed. Status code: " +
            response.data.data.code +
            " - " +
            response.data.data.message
        );

        return res.status(400).json({ error: "Payment Verification Failed" });
      }
    } else if (Status === "NOK") {
      // Payment was not successful
      console.log("hereeeee");

      const orderRepository = getManager().getRepository(Order);

      // Create a new order with the user's phone number and the total price
      const newOrder = orderRepository.create({
        totalPrice: req.query.Amount, // Use the amount from the verification
        orderStatus: "cancelled",
      });
      // Save the order to your database
      const savedOrder = await orderRepository.save(newOrder);

      // Clear the user's shopping cart (You can implement this function)
      // await clearUserCart(userPhone);

      return res.status(400).json({ error: "Payment was not successful" });
    } else {
      // Handle other Status values if needed
      return res.status(400).json({ error: "Invalid payment status" });
    }
  } catch (error) {
    console.error(`verifyPayment error: ${error.message}`);
    return res.status(500).json({
      error: "An error occurred while processing the payment verification.",
    });
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
  verifyPayment,
};
