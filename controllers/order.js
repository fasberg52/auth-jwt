const { getManager, getConnection, getRepository } = require("typeorm");
const Cart = require("../model/Cart");
const CartItems = require("../model/CartItems");
const Courses = require("../model/Course");
const Order = require("../model/Orders");
const OrderItems = require("../model/orderItems");
const axios = require("axios");
async function checkOutCart(req, res) {
  try {
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

    for (const cartItem of cartItems) {
      if (cartItem.courseId) {
        const course = await courseRepository.findOne({
          where: { id: cartItem.courseId },
        });

        if (course) {
          // Calculate discounted price if applicable
          const discountedPrice = course.discountPrice || course.price;
          totalPrice += discountedPrice * cartItem.quantity;
        }
      }
    }

    res.status(200).json({
      message: "Checkout successful",
      totalPrice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error on checkOutCart" });
  }
}




async function createPayment(req, res) {
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

    const cartItems = await getCartItems(cartItemsRepository, userCart.id);

    // Calculate discounted total price
    let totalPrice = 0;
    for (const cartItem of cartItems) {
      if (cartItem.courseId) {
        const course = await courseRepository.findOne({
          where: { id: cartItem.courseId },
        });
    
        if (course) {
          const discountedPrice = course.discountPrice || course.price;
          console.log(`Course: ${course.title}, Discounted Price: ${discountedPrice}, Quantity: ${cartItem.quantity}`);
          totalPrice += discountedPrice * cartItem.quantity;
        }
      }
    }
    console.log(`Total Price: ${totalPrice}`);  

    const savedOrder = await createOrder(userPhone);
    const updatedTotalPrice = await createOrderItemsAndCalculateTotalPrice(
      cartItems,
      savedOrder
    );

    const callbackUrl = buildCallbackUrl(
      updatedTotalPrice,
      userPhone,
      savedOrder.id
    );
    const requestData = buildRequestData(
      process.env.MERCHANT_ID,
      updatedTotalPrice,
      callbackUrl,
      userPhone
    );
    const response = await sendPaymentRequest(
      process.env.ZARINPAL_LINK_REQUEST,
      requestData
    );

    const code = response.data.data.code;

    if (code === 100) {
      const paymentUrl = buildPaymentUrl(response.data.data.authority);
      const cartId = cartItems[0].cartId;

      return res.json({ paymentUrl, updatedTotalPrice, cartId, savedOrder });
    } else {
      return res.status(400).json({ error: "Payment Request Failed" });
    }
  } catch (error) {
    console.error(`createPayment error: ${error}`);
    return res
      .status(500)
      .json({ error: "An error occurred while preparing the createPayment." });
  }
}


async function getCartItems(cartItemsRepository, cartId) {
  return await cartItemsRepository
    .createQueryBuilder("cartItem")
    .where("cartItem.cartId = :cartId", { cartId: cartId })
    .getMany();
}

async function createOrder(userPhone) {
  const orderRepository = getRepository(Order);
  const newOrder = orderRepository.create({
    userPhone: userPhone,
    totalPrice: 0,
    orderStatus: "pending",
  });

  return await orderRepository.save(newOrder);
}

async function createOrderItemsAndCalculateTotalPrice(cartItems, savedOrder) {
  const orderItemsRepository = getRepository(OrderItems);
  let totalPrice = 0;

  for (const cartItem of cartItems) {
    if (cartItem.courseId) {
      const course = await getCourseById(cartItem.courseId);

      if (course) {
        totalPrice += course.price * cartItem.quantity;
        const newOrderItem = orderItemsRepository.create({
          order: savedOrder,
          courseId: cartItem.courseId,
          quantity: cartItem.quantity,
        });
        await orderItemsRepository.save(newOrderItem);
      }
    }
  }

  savedOrder.totalPrice = totalPrice;
  const orderRepository = getRepository(Order);
  await orderRepository.save(savedOrder);

  return totalPrice;
}

async function getCourseById(courseId) {
  const courseRepository = getRepository(Courses);
  return await courseRepository.findOne({
    where: { id: courseId },
  });
}

function buildCallbackUrl(totalPrice, userPhone, orderId) {
  return `http://localhost:3000/verify-payment?Amount=${totalPrice}&Phone=${userPhone}&OrderId=${orderId}`;
}

function buildRequestData(merchantId, totalPrice, callbackUrl, userPhone) {
  return JSON.stringify({
    merchant_id: merchantId,
    amount: totalPrice,
    callback_url: callbackUrl,
    description: "اتصال به درگاه پرداخت",
    metadata: { mobile: userPhone },
  });
}

async function sendPaymentRequest(url, requestData) {
  return await axios.post(url, requestData, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

function buildPaymentUrl(authority) {
  return `${process.env.ZARINPAL_LINK_STARTPAY}/${authority}`;
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
        const newOrder = orderRepository.create({
          userPhone: phone,
          totalPrice: req.query.Amount,
          orderStatus: "success",
          refId: refID,
        });

        const updatedOrder = await orderRepository.save(newOrder);
        console.log(`existingOrder >> ${existingOrder}`);
        console.log(`Order updated successfully. Order ID: ${updatedOrder.id}`);

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

      const newOrder = orderRepository.create({
        userPhone: phone,
        totalPrice: req.query.Amount,
        orderStatus: "cancelled",
      });

      // Save the new order to the database
      const updatedOrder = await orderRepository.save(newOrder);
      console.log(`Order created successfully. Order ID: ${updatedOrder.id}`);
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
  createPayment,
  verifyPayment,
  clearUserCart,
};
