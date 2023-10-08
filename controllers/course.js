const Courses = require("../model/Course");
const Order = require("../model/Orders");
const { getManager } = require("typeorm");

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
    const cart = req.session.cart || [];

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
    const userId = req.user.id; // Assuming user is authenticated

    // Find all orders for the user
    const orders = await Order.find({ where: { user: userId } });

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving orders." });
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
};
