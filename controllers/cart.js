// controllers/cart.js

const { getManager, getConnection } = require("typeorm");
const Cart = require("../model/Cart");
const CartItems = require("../model/CartItems");
const Courses = require("../model/Course");
const Enrollment = require("../model/Enrollment");
async function createCartItem(req, res) {
  try {
    const { courseId } = req.body;
    const userPhone = req.user.phone;
    const defaultQuantity = 1;

    const connection = getConnection();
    const enrollmentRepository = connection.getRepository(Enrollment);
    const cartRepository = connection.getRepository(Cart);
    const cartItemsRepository = connection.getRepository(CartItems);
    const courseRepository = connection.getRepository(Courses);

    const isEnrolled = await enrollmentRepository
      .createQueryBuilder("enrollment")
      .innerJoin("enrollment.course", "course")
      .innerJoin("enrollment.order", "order")
      .innerJoin("order.user", "user")
      .where("course.id = :courseId", { courseId })
      .andWhere("user.phone = :phone", { phone: userPhone })
      .getCount();
    if (isEnrolled) {
      res
        .status(403)
        .json({ message: "شما قبلا ثبت نام کرده اید", status: 403 });
    }
    let userCart = await cartRepository.findOne({
      where: { user: { phone: userPhone } },
    });

    if (!userCart) {
      userCart = cartRepository.create({
        user: userPhone,
      });
      await cartRepository.save(userCart);
    }

    const course = await courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(400).json({ error: "دوره پیدا نشد" });
    }

    const existingCartItem = await cartItemsRepository
      .createQueryBuilder("cartItem")
      .where("cartItem.cartId = :cartId", { cartId: userCart.id })
      .andWhere("cartItem.courseId = :courseId", { courseId: courseId })
      .getOne();

    if (existingCartItem) {
      return res.status(400).json({
        error: "این دوره قبلاً به سبد خرید اضافه شده است",
        status: 400,
      });
    } else {
      const newCartItem = cartItemsRepository.create({
        cart: userCart,
        courseId: courseId,
        quantity: defaultQuantity,
      });
      await cartItemsRepository.save(newCartItem);
      //console.log(newCartItem);
      res.status(201).json({
        message: "آیتم با موفقیت اضافه شد",
        newCartItem,
        status: 201,
      });
    }
  } catch (error) {
    //console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function getUserCart(req, res) {
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

    const cartItems = await cartItemsRepository
      .createQueryBuilder("cartItem")
      .where("cartItem.cartId = :cartId", { cartId: userCart.id })
      .getMany();

    let totalCartPrice = 0;

    const cartDataPromises = cartItems.map(async (cartItem) => {
      //console.log("Processing cartItem: ", cartItem);
      if (cartItem.courseId) {
        //console.log("Course data exists for cartItem: ", cartItem.courseId);
        try {
          const course = await courseRepository.findOne({
            where: { id: cartItem.courseId },
          });
          // console.log("Fetched course data: ", course);
          if (course) {
            const discountedPrice = course.discountPrice || course.price;
            // console.log(`discountedPrice>>> ${discountedPrice}`);
            const itemPrice = discountedPrice * cartItem.quantity;

            totalCartPrice += itemPrice;

            return {
              cartItemId: cartItem.id,
              courseId: course.id,
              imageUrl: course.imageUrl,
              quantity: cartItem.quantity,
              price: discountedPrice,
              title: course.title,
              itemPrice,
            };
          }
        } catch (error) {
          //console.error("Error fetching course: ", error);
        }
      }
    });

    const cartData = await Promise.all(cartDataPromises);
    // console.log("Final cartData: ", cartData);

    res.status(200).json({ cartData, totalCartPrice, status: 200 });
  } catch (error) {
    // console.error("Error: ", error);
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

// async function saveOrder(req, res) {
//   try {
//     const userPhone = req.user.phone;
//     const connection = getConnection();
//     const cartRepository = connection.getRepository(Cart);
//     const cartItemsRepository = connection.getRepository(CartItems);
//     const courseRepository = connection.getRepository(Courses);

//     const userCart = await cartRepository.findOne({
//       where: { user: { phone: userPhone } },
//     });

//     if (!userCart) {
//       return res.status(404).json({ error: "Cart not found for the user" });
//     }

//     const cartItems = await cartItemsRepository.find({
//       where: { cart: userCart.id },
//     });

//     let totalPrice = 0;

//     for (const cartItem of cartItems) {
//       if (cartItem.courseId) {
//         const course = await courseRepository.findOne({
//           where: { id: cartItem.courseId },
//         });

//         if (course) {
//           totalPrice += course.price * cartItem.quantity;
//         }
//       }
//     }

//     const orderRepository = getManager().getRepository(Order);
//     const newOrder = orderRepository.create({
//       user: userPhone,
//       totalPrice: totalPrice,
//       orderStatus: "pending",
//     });
//     await orderRepository.save(newOrder);

//     res.status(201).json({ message: "Order placed successfully." });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while placing the order." });
//   }
// }

// async function orderDetails(req, res) {}

async function removeCartItem(req, res) {
  try {
    const { cartItemId } = req.params;

    const connection = getConnection();
    const cartItemsRepository = connection.getRepository(CartItems);

    const cartItemToRemove = await cartItemsRepository
      .createQueryBuilder("cartItem")
      .leftJoinAndSelect("cartItem.course", "course") // Assuming a relation named "course" exists in CartItems entity
      .where("cartItem.id = :cartItemId", { cartItemId })
      .getOne();

    if (!cartItemToRemove) {
      return res.status(404).json({ error: "آیتم های سبدخرید پیدا نشد" });
    }

    const courseName = cartItemToRemove.course
      ? cartItemToRemove.course.title
      : "آیتم";

    await cartItemsRepository.remove(cartItemToRemove);

    res.status(200).json({ message: `${courseName} از سبد خرید شما حذف شد` });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createCartItem,
  getUserCart,
  removeCartItem,
  // saveOrder,
  // orderDetails,
};
