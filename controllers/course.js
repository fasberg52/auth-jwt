const { response } = require("express");
const Courses = require("../model/Course");
const Order = require("../model/Orders");
const { getManager } = require("typeorm");
const ZarinpalCheckout = require("zarinpal-checkout");
const { json } = require("body-parser");

var zarinpal = ZarinpalCheckout.create(
  "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  true
);
async function getAllCourse(req, res) {
  try {
    const courseRepository = getManager().getRepository(Courses);
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const pageSize = parseInt(req.query.pageSize) || 10; // Default page size to 10 if not provided

    // Calculate the offset for pagination
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

    // Check if the course is already in the cart
    const existingItem = cart.find((item) => item.courseId === courseId);

    if (existingItem) {
      // Increase the quantity if the course is already in the cart
      existingItem.quantity++;
    } else {
      // Add the course to the cart with quantity 1
      cart.push({ courseId, quantity: 1 });
    }

    // Update the cart in the session
    req.session.cart = cart;

    res.status(200).json({ message: "Item added to the cart." });
  } catch (error) {
    console.log(`>>>>${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while creating the addToCart." });
  }
}
async function removeCart(req, res) {
  try {
    const courseId = req.params.courseId;
    
    const cart = req.session.cart || [];

    // Find the index of the course in the cart
    const index = cart.findIndex((item) => item.courseId === courseId);

    if (index !== -1) {
      // Remove the course from the cart
      cart.splice(index, 1);
      // Update the cart in the session
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

    // Assuming user is authenticated
    const userId = req.user.phone;

    // Retrieve the cart data from the session
    const cart = req.session.cart || [];

    if (!cart.length) {
      return res
        .status(400)
        .json({ error: "Cart is empty. Cannot place an order." });
    }

    // Calculate the total price of the order based on cart items
    let totalPrice = 0;

    for (const cartItem of cart) {
      const courseRepository = getManager().getRepository(Courses);

      // Specify the selection condition using the `where` option
      const course = await courseRepository.findOne({
        where: { id: cartItem.courseId },
      });

      if (course) {
        totalPrice += course.price * cartItem.quantity;
      }
    }

    // Create an order with the selected courses
    const orderRepository = getManager().getRepository(Order); // Adjust the import path

    const newOrder = orderRepository.create({
      user: userId, // Assuming `user` is the correct foreign key reference
      totalPrice: totalPrice,
      orderStatus: "pending",
    });

    const savedOrder = await orderRepository.save(newOrder);

    // Clear the user's shopping cart after a successful order
    req.session.cart = [];

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
      // User is not authenticated, return an error or appropriate response
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userPhone = req.user.phone;

    // Now you can safely access req.user.phone

    // Find all orders for the authenticated user
    const orderRepository = getManager().getRepository(Order);

    const orders = await orderRepository.find({ where: { userPhone } }); // Use the correct property name

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
    // Retrieve the cart data from the session
    console.log("Session Data Before getCheckout:", req.session);

    const cart = req.session.cart || [];
    console.log("Session Data After getCheckout:", req.session);


    if (!cart.length) {
      return res
        .status(400)
        .json({ error: "Cart is empty. Cannot proceed to checkout." });
    }

    // Calculate the total price of the items in the cart
    let totalPrice = 0;

    for (const cartItem of cart) {
      const courseRepository = getManager().getRepository(Courses);

      // Specify the selection condition using the `where` option
      const course = await courseRepository.findOne({
        where: { id: cartItem.courseId },
      });

      if (course) {
        totalPrice += course.price * cartItem.quantity;
      }
    }

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
    // Retrieve the cart data from the session
    console.log("Session Data Before getPayment:", req.session);

    const cart = req.session.cart || [];
    console.log("Session Data After getPayment:", req.session);

    if (!cart.length) {
      return res
        .status(400)
        .json({ error: "Cart is empty. Cannot proceed to checkout." });
    }

    // Calculate the total price of the items in the cart
    let totalPrice = 0;

    for (const cartItem of cart) {
      const courseRepository = getManager().getRepository(Courses);

      // Specify the selection condition using the `where` option
      const course = await courseRepository.findOne({
        where: { id: cartItem.courseId },
      });

      if (course) {
        totalPrice += course.price * cartItem.quantity;
      }
    }
    const responose = await zarinpal.PaymentRequest({
      Amount: totalPrice,
      CallbackURL: "http://localhost:3000/course/check-payment",
      Description: "تست اتصال به درگاه پرداخت",
      Email: "test@gmail.com",
      Mobile: "0912000000",
    });

    // Return the total price and the cart items to the client for checkout
    res.status(200).json(responose);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while preparing the checkout." });
  }
}

async function checkPayment(req, res) {
  try {
    console.log("Session Data Before checkPayment to Cart:", req.session);

    const cart = req.session.cart || [];
    console.log("Session Data After checkPayment to Cart:", req.session);

    console.log("Contents of Cart:", cart); // Debugging statement

    if (!cart.length) {
      return res
        .status(400)
        .json({ error: "Cart is empty. Cannot proceed to checkout." });
    }

    // Calculate the total price of the items in the cart
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

    const authority = req.query.Authority;
    console.log("Authority:", authority);

    const status = req.query.Status; // Access query parameter 'Status' like this
    console.log("Status:", status);

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
          totalPrice: totalPrice,
          orderStatus: "success", // You can set an initial status
        });

        const savedOrder = await orderRepository.save(newOrder);

        // Clear the user's shopping cart after a successful order
        req.session.cart = [];

        console.log("Order placed successfully. Order ID: " + savedOrder.id);

        // Redirect to a success page or return a success response
        return res.status(200).json({ message: "Payment successful" });
      } else {
        // Payment verification failed, handle the error
        console.error(
          "Payment Verification Failed. Status code: " + response.status
        );

        // You might want to return an error response or redirect the user to a failure page
        return res.status(400).json({ error: "Payment verification failed" });
      }
    } else if (status === "NOK") {
      // Payment was not successful, create a canceled order and return an appropriate response
      const userId = req.user.phone;
      const orderRepository = getManager().getRepository(Order);

      const newOrder = orderRepository.create({
        user: userId,
        totalPrice: totalPrice,
        orderStatus: "cancelled", // You can set an initial status
      });

      const savedOrder = await orderRepository.save(newOrder);
      return res.status(400).json({ error: "Payment was not successful" });
    }
  } catch (error) {
    console.error(error);
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
