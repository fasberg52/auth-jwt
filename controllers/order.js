const { getManager, getConnection, getRepository } = require("typeorm");
const Cart = require("../model/Cart");
const CartItems = require("../model/CartItems");
const Courses = require("../model/Course");
const Order = require("../model/Orders");
const Enrollment = require("../model/Enrollment");
const Quiz = require("../model/quiz");
const axios = require("axios");
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
        if (cartItem.courseId) {
          try {
            const courseId = cartItem.courseId;
            const course = await transactionalEntityManager.findOne(Courses, {
              where: { id: courseId },
            });

            if (course) {
              await createEnrollment(
                course,
                cartItem.quantity,
                userPhone,
                savedOrder.id,
                transactionalEntityManager
              );

              enrollments.push({
                courseId: course.id,
                quantity: cartItem.quantity,
                price: course.price,
                discountPrice: course.discountPrice,
              });
            }
          } catch (error) {
            console.error("Error processing cart item:", error);
          }
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
  item,
  quantity,
  userPhone,
  orderId,
  entityManager
) {
  const enrollmentRepository = entityManager.getRepository(Enrollment);

  const newItemType = item.itemType; // Assuming the item structure has an 'itemType' property

  if (newItemType === 'course') {
    const course = await entityManager.findOne(Courses, {
      where: { id: item.courseId },
    });

    if (course) {
      const newEnrollment = enrollmentRepository.create({
        courseId: course.id,
        quantity: quantity,
        userPhone: userPhone,
        orderId: orderId,
      });

      return enrollmentRepository.save(newEnrollment);
    }
  } else if (newItemType === 'azmoon') {
    const quiz = await entityManager.findOne(Quiz, {
      where: { id: item.quizId },
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
      .take(pageSize);

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
      .getRawOne();

    const successCount = await orderRepository
      .createQueryBuilder("order")
      .select("COUNT(order.orderStatus)", "count")
      .where("order.orderStatus = :orderStatus", { orderStatus: "success" })
      .getRawOne();

    const cancelledCount = await orderRepository
      .createQueryBuilder("order")
      .select("COUNT(order.orderStatus)", "count")
      .where("order.orderStatus = :orderStatus", { orderStatus: "cancelled" })
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
      .select(["order"])
      .addSelect(["user.firstName", "user.lastName"])
      .addSelect([
        "enrollments.courseId",
        "course.title",
        "course.price",
        "course.imageUrl",
        "course.discountPrice",
      ])
      .where("order.id = :orderId", { orderId })
      .getOne();

    if (!order) {
      return res.status(404).json({ error: "سفارش پیدا نشد" });
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error(`getOrderById error: ${error}`);
    res.status(500).json({ error: "Internal server error on getOrderById" });
  }
}

module.exports = {
  checkOutCart,
  createPayment,
  verifyPayment,
  getAllOrders,
  getOrderById,
  createOrder,
};
