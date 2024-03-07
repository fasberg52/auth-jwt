const { getManager, getConnection, getRepository } = require("typeorm");
const Cart = require("../model/Cart");
const CartItems = require("../model/CartItems");
const Courses = require("../model/Course");
const Order = require("../model/Orders");
const Enrollment = require("../model/Enrollment");
const Quiz = require("../model/quiz");
const axios = require("axios");
const logger = require("../services/logger");
const { convertToJalaliDate } = require("../services/jalaliService");

async function checkOutCart(req, res) {
  try {
    const { orderId } = req.params;
    const userPhone = req.user.phone;
    const userCart = req.session.cart;
    const orderRepository = getRepository(Order);
    const courseRepository = getConnection().getRepository(Courses);
    const quizRepository = getConnection().getRepository(Quiz);

    console.log(`session in checkout ${JSON.stringify(req.session.cart)}`);
    console.log(`session in checkout ${JSON.stringify(req.session)}`);

    if (!userCart || !userCart.items || userCart.items.length === 0) {
      return res.status(404).json({ error: "Cart is empty" });
    }

    let originalTotalPrice = 0;

    for (const cartItem of userCart.items) {
      if (cartItem.courseId) {
        const course = await courseRepository.findOne({
          where: { id: cartItem.courseId },
        });

        if (course) {
          const discountedPrice = course.discountPrice || course.price;
          originalTotalPrice += discountedPrice * cartItem.quantity;
        }
      } else if (cartItem.quizId) {
        const quiz = await quizRepository.findOne({
          where: { id: cartItem.quizId },
        });

        if (quiz) {
          originalTotalPrice += quiz.examPrice * cartItem.quantity;
        }
      }
    }

    if (!orderId) {
      const savedOrder = await createOrder(userPhone, originalTotalPrice);
      const sumPrice = originalTotalPrice;
      res.status(200).json({
        message: "Checkout successful",
        orderId: savedOrder.id,
        originalTotalPrice,
        discountTotalPrice: savedOrder.discountTotalPrice,
        sumPrice,
        status: 200,
      });
    } else {
      const existingOrder = await orderRepository.findOneBy({
        id: orderId,
      });

      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }

      const sumPrice =
        existingOrder.originalTotalPrice - existingOrder.discountTotalPrice;

      res.status(200).json({
        orderId: existingOrder.id,
        originalTotalPrice,
        discountTotalPrice: existingOrder.discountTotalPrice,
        sumPrice,
        status: 200,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error on checkOutCart" });
  }
}

async function createOrder(userPhone, originalTotalPrice) {
  const orderRepository = getRepository(Order);
  const newOrder = orderRepository.create({
    userPhone: userPhone,
    originalTotalPrice: originalTotalPrice,
    orderStatus: "preInvoice",
  });

  return await orderRepository.save(newOrder);
}

// async function createPayment(req, res) {
//   const userPhone = req.user.phone;
//   let savedOrder;

//   console.log("response received");
//   try {
//     await getManager().transaction(async (transactionalEntityManager) => {
//       const userCart = req.session.cart;
//       if (!userCart) {
//         return res.status(404).json({ error: "Cart not found for the user" });
//       }
//       const orderRepository = getRepository(Order);
//       const existingOrder = await orderRepository.findOne({
//         where: { userPhone: userPhone, orderStatus: "preInvoice" },
//         order: {
//           orderDate: "DESC",
//         },
//       });

//       if (!existingOrder) {
//         return res
//           .status(404)
//           .json({ error: "Order not found with 'preInvoice' status" });
//       }

//       existingOrder.orderStatus = "pending";

//       savedOrder = await orderRepository.save(existingOrder);

//       const originalTotalPrice = existingOrder.originalTotalPrice;

//       const cartItems = userCart.items;
//       console.log(`cartItems >>>>> ${JSON.stringify(cartItems)}`);

//       const enrollments = [];

//       for (const cartItem of cartItems) {
//         if (cartItem.courseId) {
//           try {
//             const courseId = cartItem.courseId;
//             const course = await transactionalEntityManager.findOne(Courses, {
//               where: { id: courseId },
//             });

//             if (course) {
//               await createEnrollment(
//                 course,
//                 cartItem.quantity,
//                 userPhone,
//                 savedOrder.id,
//                 transactionalEntityManager
//               );

//               enrollments.push({
//                 courseId: course.id,
//                 quantity: cartItem.quantity,
//                 price: course.price,
//                 discountPrice: course.discountPrice,
//               });
//             }
//           } catch (error) {
//             console.error("Error processing cart item:", error);
//           }
//         }
//       }
//       const sumPrice =
//         existingOrder.originalTotalPrice - existingOrder.discountTotalPrice;
//       const updatedTotalPriceInRials = sumPrice * 10;

//       const callbackUrl = buildCallbackUrl(
//         updatedTotalPriceInRials,
//         userPhone,
//         savedOrder.id
//       );
//       const requestData = buildRequestData(
//         process.env.MERCHANT_ID,
//         updatedTotalPriceInRials,
//         callbackUrl,
//         userPhone
//       );

//       const response = await sendPaymentRequest(
//         process.env.ZARINPAL_LINK_REQUEST,
//         requestData
//       );

//       const code = response.data.data.code;

//       if (code === 100) {
//         const paymentUrl = buildPaymentUrl(response.data.data.authority);

//         return res.json({
//           paymentUrl,
//           updatedTotalPrice: updatedTotalPriceInRials,
//           sessionId: req.sessionID,
//           savedOrder,
//           orderId: savedOrder.id,
//           enrollments,
//         });
//       } else {
//         return res
//           .status(400)
//           .json({ error: "درخواست پرداخت با خطا مواجه شد" });
//       }
//     });
//   } catch (error) {
//     console.error(`createPayment error: ${error}`);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// }

async function createPayment(req, res) {
  const userPhone = req.user.phone;
  let savedOrder;

  console.log("response received");
  try {
    await getManager().transaction(async (transactionalEntityManager) => {
      const userCart = req.session.cart;

      if (!userCart) {
        return res.status(404).json({ error: "Cart not found for the user" });
      }

      const orderRepository = getRepository(Order);
      const existingOrder = await orderRepository.findOne({
        where: { userPhone: userPhone, orderStatus: "preInvoice" },
        order: {
          orderDate: "DESC",
        },
      });

      if (!existingOrder) {
        return res
          .status(404)
          .json({ error: "Order not found with 'preInvoice' status" });
      }

      existingOrder.orderStatus = "pending";
      savedOrder = await orderRepository.save(existingOrder);

      const originalTotalPrice = existingOrder.originalTotalPrice;
      const cartItems = userCart.items;
      console.log(`cartItems >>>>> ${JSON.stringify(cartItems)}`);

      const enrollments = [];

      for (const cartItem of cartItems) {
        const enrollment = await createEnrollment(
          cartItem,
          cartItem.quantity,
          userPhone,
          savedOrder.id,
          transactionalEntityManager
        );

        if (enrollment) {
          enrollments.push(enrollment);
        }
      }

      const sumPrice =
        existingOrder.originalTotalPrice - existingOrder.discountTotalPrice;
      const updatedTotalPriceInRials = sumPrice * 10;

      const callbackUrl = buildCallbackUrl(
        updatedTotalPriceInRials,
        userPhone,
        savedOrder.id
      );
      const requestData = buildRequestData(
        process.env.MERCHANT_ID,
        updatedTotalPriceInRials,
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

        return res.json({
          paymentUrl,
          updatedTotalPrice: updatedTotalPriceInRials,
          sessionId: req.sessionID,
          savedOrder,
          orderId: savedOrder.id,
          enrollments,
        });
      } else {
        return res
          .status(400)
          .json({ error: "درخواست پرداخت با خطا مواجه شد" });
      }
    });
  } catch (error) {
    console.error(`createPayment error: ${error}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function createEnrollment(
  cartItem,
  quantity,
  userPhone,
  orderId,
  entityManager
) {
  const enrollmentRepository = entityManager.getRepository(Enrollment);

  if (cartItem.itemType === "course" && cartItem.courseId) {
    const course = await entityManager.findOne(Courses, {
      where: { id: cartItem.courseId },
    });

    if (course) {
      const newEnrollment = enrollmentRepository.create({
        courseId: course.id,
        quantity: quantity,
        userPhone: userPhone,
        orderId: orderId,
      });
      console.log("Creating enrollment:", newEnrollment);
      return enrollmentRepository.save(newEnrollment);
    }
  } else if (cartItem.itemType === "azmoon" && cartItem.quizId) {
    const quiz = await entityManager.findOne(Quiz, {
      where: { id: cartItem.quizId },
    });

    if (quiz) {
      const newEnrollment = enrollmentRepository.create({
        quizId: quiz.id,
        quantity: quantity,
        userPhone: userPhone,
        orderId: orderId,
      });

      return enrollmentRepository.save(newEnrollment);
    }
  }

  return null;
}

function applyDiscount(originalTotalPrice, discountPercentage) {
  const discountAmount = (discountPercentage / 100) * originalTotalPrice;
  const discountTotalPrice = originalTotalPrice - discountAmount;
  return discountTotalPrice;
}
async function getCartItems(cartItemsRepository, cartId) {
  return await cartItemsRepository
    .createQueryBuilder("cartItem")
    .where("cartItem.cartId = :cartId", { cartId: cartId })
    .getMany();
}

async function getCourseById(courseId) {
  const courseRepository = getRepository(Courses);
  return await courseRepository.findOne({
    where: { id: courseId },
  });
}

function buildCallbackUrl(totalPrice, userPhone, orderId) {
  return `${process.env.CALLBACKURL_ZARIPAL}/payment-verify?Amount=${totalPrice}&Phone=${userPhone}&OrderId=${orderId}`;
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
  return await axios
    .post(url, requestData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      withCredentials: true,
    })
    .catch((error) => {
      console.log(error.response);
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
      const amount = Amount;
      const amountInTomans = Amount / 10;
      const merchant_id = process.env.MERCHANT_ID;

      const verificationData = JSON.stringify({
        merchant_id: merchant_id,
        authority: Authority,
        amount: amount,
      });

      response = await axios
        .post(`${process.env.ZARINPAL_LINK_VERIFY}`, verificationData, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          withCredentials: true,
        })
        .catch((error) => {
          console.log(error.response);
        });

      const code = response.data.data.code;

      if (code == 100) {
        const refID = response.data.data.ref_id;
        const cardPen = response.data.data.card_pen;

        const orderRepository = getManager().getRepository(Order);
        const phone = req.query.Phone || "UNKNOWN";

        const existingOrder = await orderRepository.findOne({
          where: { id: OrderId, userPhone: phone, orderStatus: "pending" },
        });
        if (!existingOrder) {
          return res
            .status(400)
            .json({ error: "Invalid order or order is not pending" });
        }

        await clearUserCart(req);

        existingOrder.userPhone = phone;
        existingOrder.totalPrice = amountInTomans;
        existingOrder.orderStatus = "success";
        existingOrder.refId = refID;
        existingOrder.cardPen = cardPen;
        const updateOrder = await orderRepository.save(existingOrder);

        return res.render("payment", {
          orderStatus: "success",
          updateOrder,
        });
        // return res
        //   .status(200)
        //   .json({ message: "Payment verification succeeded", updateOrder });
      }
    } else if (Status === "NOK") {
      const orderRepository = getManager().getRepository(Order);
      const phone = req.query.Phone || "UNKNOWN";
      const amountInTomans = Amount / 10;

      const existingOrder = await orderRepository.findOne({
        where: { id: OrderId, userPhone: phone, orderStatus: "pending" },
      });
      if (!existingOrder) {
        return res
          .status(400)
          .json({ error: "Invalid order or order is not pending" });
      }
      existingOrder.userPhone = phone;
      existingOrder.totalPrice = amountInTomans;
      existingOrder.orderStatus = "cancelled";

      const updateOrder = await orderRepository.save(existingOrder);

      //await clearUserCart(req.query.Phone);

      return res.render("payment", {
        orderStatus: "cancelled",
        error: "پرداخت انجام شده از طرف سرویس دهنده تایید نشد",
      });
    } else {
      return res.render("payment", {
        orderStatus: "cancelled",
        error: "Inavlid Payment Status",
      });
    }
  } catch (error) {
    console.dir(`verifyPayment error: ${error}`);
    return res.status(500).json({
      error: "An error occurred while processing the payment verification.",
    });
  }
}

async function clearUserCart(req) {
  try {
    if (req.session && req.session.cart) {
      req.session.cart = [];
    }
  } catch (error) {
    logger.error(`clearUserCart error: ${error}`);
  }
}

async function getAllOrders(req, res) {
  try {
    const {
      sortBy = "orderDate",
      sortOrder = "DESC",
      page = 1,
      pageSize = 20,
      searchId,
      searchName,
      searchOrderDate,
      orderStatus,
    } = req.query;

    const orderRepository = getRepository(Order);
    const offset = (page - 1) * pageSize;

    const queryBuilder = orderRepository
      .createQueryBuilder("order")
      .leftJoin("order.user", "user")
      .select([
        "order.id",
        "order.orderStatus",
        "order.orderDate",
        "order.originalTotalPrice",
        "order.discountTotalPrice",
      ])
      .addSelect(["user.id", "user.firstName", "user.lastName"])
      .orderBy(`order.${sortBy}`, sortOrder)
      .skip(offset)
      .take(pageSize)
      .andWhere("order.orderStatus != :preInvoice", {
        preInvoice: "preInvoice",
      });

    if (searchId) {
      queryBuilder.andWhere("order.id = :searchId", {
        searchId: parseInt(searchId),
      });
    }

    if (searchName) {
      const fullNameSearch = `%${searchName}%`;
      queryBuilder.andWhere(
        "CONCAT(user.firstName, ' ', user.lastName) ILIKE :fullNameSearch",
        { fullNameSearch }
      );
    }

    if (searchOrderDate) {
      queryBuilder.andWhere("order.orderDate::text ILIKE :searchOrderDate", {
        searchOrderDate: `%${searchOrderDate}%`,
      });
    }

    if (orderStatus) {
      queryBuilder.andWhere("order.orderStatus = :orderStatus", {
        orderStatus,
      });
    }

    const pendingCount = await orderRepository
      .createQueryBuilder("order")
      .select("COUNT(order.orderStatus)", "count")
      .where("order.orderStatus = :orderStatus", { orderStatus: "pending" })
      .andWhere("order.orderStatus != :preInvoice", {
        preInvoice: "preInvoice",
      })
      .getRawOne();

    const successCount = await orderRepository
      .createQueryBuilder("order")
      .select("COUNT(order.orderStatus)", "count")
      .where("order.orderStatus = :orderStatus", { orderStatus: "success" })
      .andWhere("order.orderStatus != :preInvoice", {
        preInvoice: "preInvoice",
      })
      .getRawOne();

    const cancelledCount = await orderRepository
      .createQueryBuilder("order")
      .select("COUNT(order.orderStatus)", "count")
      .where("order.orderStatus = :orderStatus", { orderStatus: "cancelled" })
      .andWhere("order.orderStatus != :preInvoice", {
        preInvoice: "preInvoice",
      })
      .getRawOne();

    const orders = await queryBuilder.getMany();
    const totalCount = await orderRepository.count();

    res.status(200).json({
      orders: orders,
      totalCount,
      pendingCount: pendingCount.count,
      successCount: successCount.count,
      cancelledCount: cancelledCount.count,
    });
  } catch (error) {
    console.error(`getAllOrders error: ${error}`);
    res.status(500).json({ error: "Internal server error on getAllOrders" });
  }
}

async function getOrderById(req, res) {
  try {
    const orderId = req.params.id;
    const orderRepository = getRepository(Order);

    const order = await orderRepository
      .createQueryBuilder("order")
      .leftJoin("order.user", "user")
      .leftJoin("order.enrollments", "enrollments")
      .leftJoinAndSelect("enrollments.course", "course")
      .leftJoin("order.coupons", "coupon")
      .leftJoin("enrollments.quiz", "quiz")
      .select(["order"])
      .addSelect(["user.firstName", "user.lastName"])
      .addSelect([
        "enrollments.courseId",
        "course.title",
        "course.price",
        "course.discountPrice",
        "course.imageUrl",
      ])
      .addSelect([
        "enrollments.quizId",
        "quiz.examTitle",
        "quiz.examPrice",
        "quiz.itemType",
      ])
      .addSelect(["coupon.id", "coupon.code", "coupon.discountPercentage"])
      .where("order.id = :orderId", { orderId })
      .getOne();

    if (!order) {
      return res.status(404).json({ error: "سفارش پیدا نشد" });
    }

    // Process enrollments to calculate both itemPrice and discountItemPrice
    if (order.enrollments && order.enrollments.length > 0) {
      order.enrollments.forEach((enrollment) => {
        if (enrollment.course) {
          enrollment.course.itemPrice =
            enrollment.course.discountPrice || enrollment.course.price;
          enrollment.course.discountItemPrice = order.coupons
            ?.discountPercentage
            ? applyDiscount(
                enrollment.course.itemPrice,
                order.coupons.discountPercentage
              )
            : null;
        }
        if (enrollment.quiz) {
          enrollment.quiz.itemPrice = enrollment.quiz.examPrice;
          enrollment.quiz.discountItemPrice = order.coupons?.discountPercentage
            ? applyDiscount(
                enrollment.quiz.itemPrice,
                order.coupons.discountPercentage
              )
            : null;
        }
      });
    }

    // Remove unnecessary properties
    if (order.enrollments) {
      order.enrollments = order.enrollments.map((enrollment) => {
        return {
          courseId: enrollment.courseId,
          quizId: enrollment.quizId,
          course: enrollment.course,
          quiz: enrollment.quiz,
        };
      });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error(`getOrderById error: ${error}`);
    res.status(500).json({ error: "Internal server error on getOrderById" });
  }
}

function applyDiscount(originalPrice, discountPercentage) {
  const discountAmount = (originalPrice * discountPercentage) / 100;
  const discountedPrice = originalPrice - discountAmount;
  return discountedPrice;
}

async function updateOrderById(req, res) {
  try {
    const orderId = req.params.id;
    const orderRepository = getRepository(Order);

    const orderToUpdate = await orderRepository.findOneBy({ id: orderId });

    if (!orderToUpdate) {
      return res.status(404).json({ error: "سفارش پیدا نشد", status: 404 });
    }

    if (req.body.originalTotalPrice !== undefined) {
      orderToUpdate.originalTotalPrice = req.body.originalTotalPrice;
    }
    if (req.body.orderStatus !== undefined) {
      orderToUpdate.orderStatus = req.body.orderStatus;
    }
    if (req.body.discountTotalPrice !== undefined) {
      orderToUpdate.discountTotalPrice = req.body.discountTotalPrice;
    }

    if (req.body.coupons !== undefined) {
      orderToUpdate.coupons = req.body.coupons;
    }

    const updatedOrder = await orderRepository.save(orderToUpdate);

    res.status(200).json({
      message: "سفارش با موفقیت به‌روزرسانی شد",
      order: updatedOrder,
      status: 200,
    });
  } catch (error) {
    console.error(`updateOrderById error: ${error}`);
    res.status(500).json({ error: "Internal server error on updateOrderById" });
  }
}

// async function getAllSuccessOrdersByCourseId(req, res) {
//   try {
//     const { courseId } = req.params;
//     const { sortBy = "orderDate", sortOrder = "DESC" } = req.query;
//     const orderRepository = getRepository(Order);

//     const queryBuilder = orderRepository
//       .createQueryBuilder("order")
//       .leftJoin("order.user", "user")
//       .leftJoin("order.enrollments", "enrollments")
//       .leftJoin("enrollments.course", "course")
//       .select([
//         "order.id",
//         "order.orderStatus",
//         "order.orderDate",
//         "order.originalTotalPrice",
//         "order.discountTotalPrice",
//       ])
//       .addSelect(["user.id", "user.firstName", "user.lastName"])
//       .orderBy(`order.${sortBy}`, sortOrder)
//       .where("order.orderStatus = :orderStatus", {
//         orderStatus: "success",
//       })
//       .andWhere("course.id = :courseId", { courseId: parseInt(courseId) });

//     const successOrders = await queryBuilder.getMany();
//     const totalCount = successOrders.length;

//     res.status(200).json({
//       successOrders,
//       totalCount,
//     });
//   } catch (error) {
//     console.error(`getAllSuccessOrdersByCourseId error: ${error}`);
//     res.status(500).json({
//       error: "Internal server error on getAllSuccessOrdersByCourseId",
//     });
//   }
// }
async function getAllSuccessOrdersByCourseId(req, res) {
  try {
    const courseId = req.params.courseId;
    const { startDate, endDate } = req.query;
    const orderRepository = getRepository(Order);

    const queryBuilder = orderRepository
      .createQueryBuilder("order")
      .leftJoin("order.enrollments", "enrollments")
      .leftJoinAndSelect("enrollments.course", "course")
      .leftJoinAndSelect("enrollments.quiz", "quiz")
      .leftJoin("order.coupons", "coupon")
      .select(["order"])
      .addSelect([
        "enrollments.courseId",
        "course.title",
        "course.price",
        "course.discountPrice",
        "course.imageUrl",
      ])
      .addSelect([
        "enrollments.quizId",
        "quiz.examTitle",
        "quiz.examPrice",
        "quiz.itemType",
      ])
      .addSelect(["coupon.id", "coupon.code", "coupon.discountPercentage"])
      .where("course.id = :courseId", { courseId })
      .andWhere("order.orderStatus = :orderStatus", { orderStatus: "success" });

    // Apply date range filter if startDate and endDate are provided
    if (startDate && endDate) {
      queryBuilder.andWhere("order.orderDate BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      });
    }

    const orders = await queryBuilder
      .orderBy("order.orderDate", "ASC")
      .getMany();

    let totalCount = 0;

    orders.forEach((order) => {
      totalCount += order.numberoforders || 0;
      if (order.enrollments && order.enrollments.length > 0) {
        order.enrollments.forEach((enrollment) => {
          if (enrollment.course) {
            enrollment.course.itemPrice =
              enrollment.course.discountPrice || enrollment.course.price;
            enrollment.course.discountItemPrice = order.coupons
              ?.discountPercentage
              ? applyDiscount(
                  enrollment.course.itemPrice,
                  order.coupons.discountPercentage
                )
              : null;
          }
          if (enrollment.quiz) {
            enrollment.quiz.itemPrice = enrollment.quiz.examPrice;
            enrollment.quiz.discountItemPrice = order.coupons
              ?.discountPercentage
              ? applyDiscount(
                  enrollment.quiz.itemPrice,
                  order.coupons.discountPercentage
                )
              : null;
          }
        });
      }
    });

    res.status(200).json({ orders, totalCount });
  } catch (error) {
    console.error(`getAllSuccessOrdersByCourseId error: ${error}`);
    res.status(500).json({
      error: "Internal server error on getAllSuccessOrdersByCourseId",
    });
  }
}
async function getSalesByDateAndCourse(req, res) {
  try {
    const { courseId, startDate, endDate } = req.query;
    const orderRepository = getRepository(Order);

    const queryBuilder = orderRepository
      .createQueryBuilder("order")
      .leftJoin("order.enrollments", "enrollments")
      .leftJoinAndSelect("enrollments.course", "course")
      .select([
        "DATE(order.orderDate) as orderDate",
        "COUNT(order.id) as totalCount",
      ])
      .where("course.id = :courseId", { courseId })
      .andWhere("order.orderStatus = :orderStatus", { orderStatus: "success" });

    if (startDate && endDate) {
      queryBuilder.andWhere(
        "DATE(order.orderDate) BETWEEN :startDate AND :endDate",
        {
          startDate,
          endDate,
        }
      );
    }

    const salesByDateAndCourse = await queryBuilder
      .groupBy("DATE(order.orderDate)")
      .orderBy("orderDate", "ASC")
      .getRawMany();

    res.status(200).json({ salesByDateAndCourse });
  } catch (error) {
    console.error(`getSalesByDateAndCourse error: ${error}`);
    res.status(500).json({
      error: "Internal server error on getSalesByDateAndCourse",
    });
  }
}

async function pendingCartToCartPayment(req, res) {
  try {
    const { orderId, cardPen, refId } = req.body;
    const userCart = req.session.cart;
    const cartItems = userCart.items;
    const orderRepository = getRepository(Order);

    const existingOrder = await orderRepository.findOne({
      where: { id: orderId },
      relations: ["enrollments"],
    });

    if (!existingOrder) {
      return res
        .status(404)
        .json({ error: "این سفارش وجود ندارد", status: 404 });
    }

    if (existingOrder.orderStatus !== "preInvoice") {
      return res.status(400).json({
        error: "وضعیت سفارش مشخص نیست",
        status: 400,
      });
    }

    existingOrder.orderStatus = "pending";
    existingOrder.gatewayPay = "cbc";
    existingOrder.paymentType = "offline";
    existingOrder.cardPen = cardPen;
    existingOrder.refId = refId;
    const savedOrder = await orderRepository.save(existingOrder);

    const enrollments = [];

    for (const cartItem of cartItems) {
      const enrollment = await createEnrollment(
        cartItem,
        cartItem.quantity,
        existingOrder.userPhone,
        existingOrder.id,
        getManager()
      );

      if (enrollment) {
        enrollments.push(enrollment);
      }
    }

    const sumPrice =
      existingOrder.originalTotalPrice - existingOrder.discountTotalPrice;
    const updatedTotalPriceInRials = sumPrice * 10;
    await clearUserCart(req);

    return res.status(200).json({
      savedOrder,
      updatedTotalPrice: updatedTotalPriceInRials,
      enrollments,
      status: 200,
    });
  } catch (error) {
    console.error(`error in pendingCartToCartPayment : ${error}`);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function acceptedCartToCartPayment(req, res) {
  try {
    const { orderId } = req.body;
    const orderRepository = getRepository(Order);
    const exitingOrder = await orderRepository.findOneBy({
      id: orderId,
    });

    if (!exitingOrder) {
      res.status(404).json({ error: "این سفارش وجود ندارد", status: 404 });
    }
    exitingOrder.orderStatus = "success";
    const saveOrder = await orderRepository.save(exitingOrder);
    res.status(200).json({ saveOrder, status: 200 });
  } catch (error) {
    logger.error(`error in acceptedCartToCartPayment : ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function cancellCartToCartPayment(req, res) {
  try {
    const { orderId } = req.body;
    const orderRepository = getRepository(Order);
    const exitingOrder = await orderRepository.findOneBy({
      id: orderId,
    });

    if (!exitingOrder) {
      res.status(404).json({ error: "این سفارش وجود ندارد", status: 404 });
    }
    exitingOrder.orderStatus = "cancelled";
    const saveOrder = await orderRepository.save(exitingOrder);
    res.status(200).json({ saveOrder, status: 200 });
  } catch (error) {
    logger.error(`error in acceptedCartToCartPayment : ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  checkOutCart,
  createPayment,
  verifyPayment,
  getAllOrders,
  getOrderById,
  createOrder,
  getAllSuccessOrdersByCourseId,
  updateOrderById,
  getSalesByDateAndCourse,
  pendingCartToCartPayment,
  acceptedCartToCartPayment, 
  cancellCartToCartPayment,
};
