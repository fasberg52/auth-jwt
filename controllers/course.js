const { json } = require("express");
const Courses = require("../model/Course");
const Order = require("../model/Orders");
const Session = require("../model/Session");
const { getManager } = require("typeorm");
const ZarinpalCheckout = require("zarinpal-checkout");

var zarinpal = ZarinpalCheckout.create(
  "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  true
);
async function getAllCourse(req, res) {
  try {
    const courseRepository = getManager().getRepository(Courses);
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const offset = (page - 1) * pageSize;
    const allCourses = await courseRepository.find({
      skip: offset,
      take: pageSize,
    });
    res.json(allCourses);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the getAllCourse." });
  }
}

async function getProductById(req, res) {
  try {
    const courseRepository = getManager().getRepository(Courses);
    const courseId = req.params.courseId;
    const existingCourse = await courseRepository.findOne({
      where: { id: courseId },
    });
    if (existingCourse) {
      res.json(existingCourse);
    } else {
      res.status(404).json({ error: "course not found." });
    }
  } catch (error) {
    console.log(`>>>>${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while creating the getProductById." });
  }
}

async function addToCart(req, res) {
  try {
    const courseId = req.params.courseId;
    console.log("Session Data Before Adding to Cart:", req.session);

    const cart = req.session.cart || [];

    console.log("Session Data After Adding to Cart:", req.session);

    const existingItem = cart.find((item) => item.courseId === courseId);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ courseId, quantity: 1 });
    }

    req.session.cart = cart;

    res.status(200).json({ message: "Item added to the cart." });
  } catch (error) {
    console.log(`Error in addToCart: ${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while creating the addToCart." });
  }
}

async function removeCart(req, res) {
  try {
    const courseId = req.params.courseId;

    const cart = req.session.cart || [];

    const index = cart.findIndex((item) => item.courseId === courseId);

    if (index !== -1) {
      cart.splice(index, 1);
      req.session.cart = cart;
      res.status(200).json({ message: "Item removed from the cart." });
    } else {
      res.status(404).json({ error: "Item not found in the cart." });
    }
  } catch (error) {
    console.log(`>>>>${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while creating the removeCart." });
  }
}

async function getCart(req, res) {
  try {
    const cart = req.session.cart || [];
    res.status(200).json(cart);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the getCart." });
  }
}

async function placeOrder(req, res) {
  try {
    console.log("Request Body:", req.body);

    const userId = req.user.phone;

    const cart = req.session.cart || [];

    if (!cart.length) {
      return res
        .status(400)
        .json({ error: "Cart is empty. Cannot place an order." });
    }

    let totalPrice = 0;

    for (const cartItem of cart) {
      const courseRepository = getManager().getRepository(Courses);

      const course = await courseRepository.findOne({
        where: { id: cartItem.courseId },
      });

      if (course) {
        totalPrice += course.price * cartItem.quantity;
      }
    }
    if (totalPrice <= 0) {
      return res
        .status(400)
        .json({ error: "Cart total price is zero. Cannot place an order." });
    }

    const orderRepository = getManager().getRepository(Order);
    const newOrder = orderRepository.create({
      user: userId,
      totalPrice: totalPrice,
      orderStatus: "pending",
    });

    const savedOrder = await orderRepository.save(newOrder);

    // req.session.cart = [];

    res.status(201).json({ message: "Order placed successfully." });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while placing the order." });
  }
}

async function getUserOrders(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = req.user;

    const orderRepository = getManager().getRepository(Order);

    const orders = await orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .select([
        "order.id",
        "order.orderDate",
        "order.orderStatus",
        "order.totalPrice",
        "user.phone",
      ])
      .where("user.id = :userId", { userId: req.user.id })
      .getMany();
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving orders." });
  }
}

async function getCheckout(req, res) {
  try {
    console.log("Session Data Before getCheckout:", req.session);

    const cart = req.session.cart || [];

    console.log("Session Data after getCheckout:", req.session);

    if (!cart.length) {
      return res
        .status(400)
        .json({ error: "Cart is empty. Cannot proceed to checkout." });
    }

    let totalPrice = 0;

    for (const cartItem of cart) {
      const courseRepository = getManager().getRepository(Courses);

      const course = await courseRepository.findOne({
        where: { id: cartItem.courseId },
      });

      if (course) {
        totalPrice += course.price * cartItem.quantity;
      }
    }
    req.session.totalPrice = totalPrice;

    const user = req.user;

    // Return the total price and the cart items to the client for checkout
    res.status(200).json({ totalPrice, cart });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while preparing the checkout." });
  }
}

async function getPayment(req, res) {
  try {
    const sid = req.params.sid;
    const sessionRepository = getManager().getRepository(Session);
    const session = await sessionRepository.findOne({ where: { sid: sid } });

    const totalPrice = session.sess.totalPrice;
    console.log(`Total Price: ${totalPrice}`);
    const userPhone = req.user.phone;
    const response = await zarinpal.PaymentRequest({
      Amount: totalPrice,
      CallbackURL: "http://localhost:3000/course/check-payment",
      Description: "تست اتصال به درگاه پرداخت",
      metadata: { mobile: userPhone },
      Mobile: userPhone,
    });
    console.log(`>>>>>${JSON.stringify(response)}`);

    res.status(200).json(response);
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
    const sid = req.params.sid;
    const sessionRepository = getManager().getRepository(Session);
    const session = await sessionRepository.findOne({ where: { sid: sid } });

    const totalPrice = session.sess.totalPrice;
    console.log(totalPrice);
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
          totalPrice: totalPrice || 0,
          orderStatus: "success",
        });

        const savedOrder = await orderRepository.save(newOrder);

        // Clear the user's shopping cart after a successful order
        req.session.cart = [];
        console.log("totalPrice : " + totalPrice);

        console.log("Order placed successfully. Order ID: " + savedOrder.id);

        return res.status(200).json({ message: "Payment successful" });
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
  getAllCourse,
  getProductById,
  addToCart,
  removeCart,
  getCart,
  placeOrder,
  getUserOrders,
  getCheckout,
  getPayment,
  checkPayment,
};
