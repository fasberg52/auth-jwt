const Courses = require("../model/Course");
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
module.exports = {
  getAllCourse,
  getProductById,
  addToCart,
  removeCart,
  getCart,
};
