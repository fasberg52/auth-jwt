// controllers/cart.js

const { getManager, getConnection } = require("typeorm");
const Cart = require("../model/Cart");
const CartItems = require("../model/CartItems");
const Courses = require("../model/Course");
const Enrollment = require("../model/Enrollment");
const Coupon = require("../model/Coupon");

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
      .andWhere("order.orderStatus = :orderStatus", { orderStatus: "success" })
      .getCount();

    if (isEnrolled) {
      return res.status(400).json({
        error: "شما قبلا ثبت نام کرده اید",
        status: 400,
      });
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

      return res.status(201).json({
        message: "آیتم با موفقیت اضافه شد",
        newCartItem,
        status: 201,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// async function getUserCart(req, res) {
//   try {
//     const userPhone = req.user.phone;
//     const connection = getConnection();
//     const cartRepository = connection.getRepository(Cart);
//     const cartItemsRepository = connection.getRepository(CartItems);
//     const courseRepository = connection.getRepository(Courses);
//     const appliedCoupon = req.appliedCoupon;
//    // const couponCode = req.query.couponCode;
//     console.log(`getAllUSer >>> ${couponCode}`);
//     const userCart = await cartRepository.findOne({
//       where: { user: { phone: userPhone } },
//     });

//     if (!userCart) {
//       return res.status(200).json({
//         cartData: [],
//         totalCartPrice: 0,
//         totalCartPriceCoupon: 0,
//         status: 200,
//       });
//     }

//     const cartItems = await cartItemsRepository
//       .createQueryBuilder("cartItem")
//       .where("cartItem.cartId = :cartId", { cartId: userCart.id })
//       .getMany();

//     let totalCartPrice = 0;

//     const cartDataPromises = cartItems.map(async (cartItem) => {
//       if (cartItem.courseId) {
//         try {
//           const course = await courseRepository.findOne({
//             where: { id: cartItem.courseId },
//           });

//           if (course) {
//             const discountedPrice = course.discountPrice || course.price;
//             const itemPrice = discountedPrice * cartItem.quantity;

//             totalCartPrice += itemPrice;

//             return {
//               cartItemId: cartItem.id,
//               courseId: course.id,
//               imageUrl: course.imageUrl,
//               quantity: cartItem.quantity,
//               price: course.price,
//               discountPrice: discountedPrice,
//               title: course.title,
//               itemPrice,
//             };
//           }
//         } catch (error) {
//           console.error("Error processing cart item:", error);
//         }
//       }
//     });

//     const cartData = await Promise.all(cartDataPromises);

//     let totalCartPriceCoupon = totalCartPrice;

//     if (couponCode) {
//       const coupon = await getManager()
//         .getRepository(Coupon)
//         .findOne({ where: { code: couponCode } });

//       if (coupon) {
//         const couponDiscount =
//           (totalCartPrice * coupon.discountPersentage) / 100;
//         totalCartPriceCoupon = totalCartPrice - couponDiscount;
//       }
//     }

//     res
//       .status(200)
//       .json({ cartData, totalCartPrice, totalCartPriceCoupon, status: 200 });
//   } catch (error) {
//     console.error("Error: ", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }

async function getUserCart(req, res) {
  try {
    const userPhone = req.user.phone;
    const connection = getConnection();
    const cartRepository = connection.getRepository(Cart);
    const cartItemsRepository = connection.getRepository(CartItems);
    const courseRepository = connection.getRepository(Courses);

    const appliedCoupon = req.appliedCoupon; // Get applied coupon from the request object
    console.log(`appliedCoupon ${appliedCoupon}`);
    const userCart = await cartRepository.findOne({
      where: { user: { phone: userPhone } },
    });

    if (!userCart) {
      return res.status(200).json({
        cartData: [],
        totalCartPrice: 0,
        totalCartPriceCoupon: 0,
        status: 200,
      });
    }

    const cartItems = await cartItemsRepository
      .createQueryBuilder("cartItem")
      .where("cartItem.cartId = :cartId", { cartId: userCart.id })
      .getMany();

    let totalCartPrice = 0;

    const cartDataPromises = cartItems.map(async (cartItem) => {
      if (cartItem.courseId) {
        try {
          const course = await courseRepository.findOne({
            where: { id: cartItem.courseId },
          });

          if (course) {
            const discountedPrice = course.discountPrice || course.price;
            const itemPrice = discountedPrice * cartItem.quantity;

            totalCartPrice += itemPrice;

            return {
              cartItemId: cartItem.id,
              courseId: course.id,
              imageUrl: course.imageUrl,
              quantity: cartItem.quantity,
              price: course.price,
              discountPrice: discountedPrice,
              title: course.title,
              itemPrice,
            };
          }
        } catch (error) {
          console.error("Error processing cart item:", error);
        }
      }
    });

    const cartData = await Promise.all(cartDataPromises);

    let totalCartPriceCoupon = totalCartPrice;

    if (appliedCoupon) {
      // Use appliedCoupon in your logic
      const couponDiscount =
        (totalCartPrice * appliedCoupon.discountPersentage) / 100;
      totalCartPriceCoupon = totalCartPrice - couponDiscount;
    }

    res
      .status(200)
      .json({ cartData, totalCartPrice, totalCartPriceCoupon, status: 200 });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

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

async function applyCoupon(req, res, next) {
  try {
    const { coupon } = req.body;

    if (!coupon) {
      return res.status(400).json({ error: "کد تخفیف را وارد کنید" });
    }

    const couponRepository = getManager().getRepository(Coupon);
    const appliedCoupon = await couponRepository.findOne({
      where: { code: coupon },
    });

    if (!appliedCoupon) {
      return res.status(404).json({ error: "کد تخفیف وجود ندارد" });
    }

    req.appliedCoupon = appliedCoupon;
    next();
    res
      .status(200)
      .json({ message: "کد تخفیف با موفقیت اعمال شد", appliedCoupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createCartItem,
  getUserCart,
  removeCartItem,
  applyCoupon,
};
