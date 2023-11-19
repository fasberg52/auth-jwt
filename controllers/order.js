const { getManager, getConnection } = require("typeorm");
const Cart = require("../model/Cart");
const CartItems = require("../model/CartItems");
const Courses = require("../model/Course");
const Order = require("../model/Orders");
const OrderItems = require("../model/OrderItems");
const axios = require("axios");
async function checkOutCart(req, res) {
  try {
    const user = req.user;
    const userPhone = req.user.phone;
    const connection = getConnection();
    const cartRepository = connection.getRepository(Cart);
    const cartItemsRepository = connection.getRepository(CartItems);
    const courseRepository = connection.getRepository(Courses);
    const orderRepository = connection.getRepository(Order);
    const orderItemsRepository = connection.getRepository(OrderItems);

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
    console.log(`cartItems >> ${JSON.stringify(cartItems)}`);

    let totalPrice = 0;

    // Create a new order with the user's phone number and total price
    const newOrder = orderRepository.create({
      userPhone: userPhone,
      totalPrice: totalPrice,
     // orderStatus: "pending",
    });

    // Save the order to your database
    const savedOrder = await orderRepository.save(newOrder);

    for (const cartItem of cartItems) {
      if (cartItem.courseId) {
        const course = await courseRepository.findOne({
          where: { id: cartItem.courseId },
        });

        if (course) {
          totalPrice += course.price * cartItem.quantity;

          // Create a new order item for each course in the cart
          const newOrderItem = orderItemsRepository.create({
            order: savedOrder,
            courseId: cartItem.courseId,
            quantity: cartItem.quantity,
          });

          // Save the order item to your database
          await orderItemsRepository.save(newOrderItem);
        }
      }
    }

    // Update the total price in the order based on the courses
    savedOrder.totalPrice = totalPrice;
    await orderRepository.save(savedOrder);

    // Clear the user's shopping cart
    // await clearUserCart(userPhone);

    res.status(200).json({
      message: "Checkout successful",
      totalPrice,
      orderId: savedOrder.id,
      savedOrder: savedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
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
    const orderRepository = connection.getRepository(Order);

    const userCart = await cartRepository.findOne({
      where: { user: { phone: userPhone } },
    });
    console.log(userCart);
    if (!userCart) {
      return res.status(404).json({ error: "Cart not found for the user" });
    }
    // const cartId = await cartRepository.finOne()
    // Calculate the total price
    let totalPrice = 0;

    const cartItems = await cartItemsRepository
      .createQueryBuilder("cartItem")
      .where("cartItem.cartId = :cartId", { cartId: userCart.id })
      .getMany();

    console.log(`cartItems >> ${JSON.stringify(cartItems)}`);

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

    const savedOrderId = req.body.orderId;

    const callbackUrl =
      "http://localhost:3000/verify-payment?" +
      `Amount=${totalPrice}&Phone=${userPhone}&OrderId=${savedOrderId}`; // Replace with your callback URL
    const description = "Transaction description.";
    const user = req.user;
    // Construct the request data
    const requestData = JSON.stringify({
      merchant_id: process.env.MERCHANT_ID,
      amount: totalPrice,
      callback_url: callbackUrl,
      description: description,
      metadata: {
        mobile: userPhone,
      },
    });
    // console.log(requestData.metadata.mobile);
    // Send a POST request to Zarinpal's payment request endpoint
    const response = await axios.post(
      `${process.env.ZARINPAL_LINK_REQUEST}`,
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
      const paymentUrl = `${process.env.ZARINPAL_LINK_STARTPAY}/${authority}`;
      console.log(paymentUrl);
      const cartId = cartItems[0].cartId;
      console.log(cartId);
      res.json({ paymentUrl, totalPrice, cartId, savedOrderId });
    } else {
      // Payment request failed
      return res.status(400).json({ error: "Payment Request Failed" });
    }
  } catch (error) {
    console.error(`getPayment error: ${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while preparing the getPayment." });
  }
}

async function verifyPayment(req, res) {
  try {
    const { Authority, Status, Amount, OrderId } = req.query;

    console.log("query", req.query);

    let response;

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

      response = await axios.post(
        `${process.env.ZARINPAL_LINK_VERIFY}`,
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

      console.log(`code  >> ${code}`);

      if (code == 100) {
        // Payment verification succeeded
        const refID = response.data.data.ref_id;

        // You can create an order and perform any other necessary actions here
        const orderRepository = getManager().getRepository(Order);
        const phone = req.query.Phone || "UNKNOWN";

        // Find the existing order with the orderId
        const existingOrder = await orderRepository.findOne({
          where: {
            id: OrderId,
            userPhone: phone,
            orderStatus: "pending",
          },
        });

        if (existingOrder) {
          // Update the existing order to "success"
          existingOrder.orderStatus = "success";
          existingOrder.totalPrice = req.query.Amount; // Update total price if needed
          existingOrder.refId = refID; // Save the refId

          const updatedOrder = await orderRepository.save(existingOrder);
          console.log(`existingOrder >> ${existingOrder}`);
          console.log(
            `Order updated successfully. Order ID: ${updatedOrder.id}`
          );
        } else {
          console.log("No order found with the given orderId.");
        }

        // Clear the user's shopping cart (You can implement this function)
        //await clearUserCart(userPhone);

        return res
          .status(200)
          .json({ message: "Payment verification succeeded", refID });
      }
    } else if (Status === "NOK") {
      // Payment was not successful
      console.log("hereeeee");
      const orderRepository = getManager().getRepository(Order);
      const phone = req.query.Phone || "UNKNOWN";
      console.log("phone : " + phone);
      const existingOrder = await orderRepository.findOne({
        where: { id: OrderId, userPhone: phone, orderStatus: "pending" },
      });
      if (existingOrder) {
        // Update the existing order to "cancelled"
        existingOrder.orderStatus = "cancelled";
        existingOrder.totalPrice = req.query.Amount; // Update total price if needed
        const updatedOrder = await orderRepository.save(existingOrder);

        console.log(`Order updated successfully. Order ID: ${updatedOrder.id}`);
      } else {
        console.log("No pending order found for cancellation.");
      }
      return res.status(400).json({ error: "Payment was not successful" });
    } else {
      // Handle other Status values if needed
      return res.status(400).json({ error: "Invalid payment status" });
    }
  } catch (error) {
    console.error(`verifyPayment error: ${error}`);
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
  checkOutCart,
  getPayment,
  verifyPayment,
  clearUserCart,
};
