const { getManager, getConnection, getRepository } = require("typeorm");
const Cart = require("../model/Cart");
const CartItems = require("../model/CartItems");
const Courses = require("../model/Course");
const Order = require("../model/Orders");
const Enrollment = require("../model/Enrollment");
const axios = require("axios");
const { convertToJalaliDate } = require("../services/jalaliService");

async function checkOutCart(req, res) {
  try {
    const userPhone = req.user.phone;
    const connection = getConnection();
    const cartRepository = connection.getRepository(Cart);
    const cartItemsRepository = connection.getRepository(CartItems);
    const courseRepository = connection.getRepository(Courses);
    const orderRepository = connection.getRepository(Order);
    const enrollmentRepository = connection.getRepository(Enrollment);

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
  const userPhone = req.user.phone;

  try {
    await getManager().transaction(async (transactionalEntityManager) => {
      const cartRepository = transactionalEntityManager.getRepository(Cart);
      const cartItemsRepository =
        transactionalEntityManager.getRepository(CartItems);
      const courseRepository =
        transactionalEntityManager.getRepository(Courses);

      const userCart = await cartRepository.findOne({
        where: { user: { phone: userPhone } },
      });

      if (!userCart) {
        return res.status(404).json({ error: "Cart not found for the user" });
      }

      const cartItems = await getCartItems(cartItemsRepository, userCart.id);

      const savedOrder = await createOrder(userPhone);
      const updatedTotalPrice = await createEnrollmentAndCalculateTotalPrice(
        cartItems,
        savedOrder,
        transactionalEntityManager
      );

      const updatedTotalPriceInRials = updatedTotalPrice * 10;
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
        const cartId = cartItems[0].cartId;

        return res.json({ paymentUrl, updatedTotalPrice, cartId, savedOrder });
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

async function createEnrollmentAndCalculateTotalPrice(cartItems, savedOrder) {
  const enrollmentRepository = getRepository(Enrollment);
  const courseRepository = getRepository(Courses);
  let totalPrice = 0;
  for (const cartItem of cartItems) {
    if (cartItem.courseId) {
      const course = await courseRepository.findOne({
        where: { id: cartItem.courseId },
      });

      if (course) {
        const discountedPrice = course.discountPrice || course.price;
        console.log(
          `Course: ${course.title}, Discounted Price: ${discountedPrice}, Quantity: ${cartItem.quantity}`
        );
        totalPrice += discountedPrice * cartItem.quantity;
        const newEnrollment = enrollmentRepository.create({
          order: savedOrder,
          courseId: cartItem.courseId,
          quantity: cartItem.quantity,
        });
        await enrollmentRepository.save(newEnrollment);
      }
    }
  }
  console.log(`Total Price: ${totalPrice}`);

  savedOrder.totalPrice = totalPrice;
  const orderRepository = getRepository(Order);
  await orderRepository.save(savedOrder);
  console.log(totalPrice);
  return totalPrice;
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
      const amountInTomans = Amount / 10;
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
        existingOrder.orderStatus = "success";
        existingOrder.refId = refID;
        const updateOrder = await orderRepository.save(existingOrder);
        // Find the existing order with the orderId

        console.log(`existingOrder >> ${existingOrder}`);
        console.log(`Order updated successfully. Order ID: ${updateOrder.id}`);

        // Clear the user's shopping cart (You can implement this function)
        //await clearUserCart(userPhone);
        return res.render("payment", {
          orderStatus: "success",
          updateOrder,
        });
        // return res
        //   .status(200)
        //   .json({ message: "Payment verification succeeded", updateOrder });
      }
    } else if (Status === "NOK") {
      console.log("hereeeee");
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
      console.log("phone : " + phone);

      console.log(`Order created successfully. Order ID: ${updateOrder.id}`);
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
    const cartItems = await cartItemsRepository.find({
      where: { cart: userCart.id },
    });

    if (cartItems.length > 0) {
      await cartItemsRepository.remove(cartItems);
    }

    await cartRepository.remove(userCart);
  }
}

async function getAllOrders(req, res) {
  try {
    const {
      sortBy = "orderDate",
      sortOrder = "DESC",
      page = 1,
      pageSize = 10,
      searchId,
      searchName,
      searchOrderDate,
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
        "order.totalPrice",
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

    const orders = await queryBuilder.getMany();
    const totalCount = await orderRepository.count();

    const jalaliOrders = orders.map((order) => ({
      ...order,
      orderDate: convertToJalaliDate(order.orderDate),
    }));

    res.status(200).json({ orders: jalaliOrders, totalCount });
  } catch (error) {
    console.error(`getAllOrders error: ${error}`);
    res.status(500).json({ error: "Internal server error on getAllOrders" });
  }
}

async function getOrderById(req, res) {
  try {
    const orderId = req.params.id;
    const orderRepository = getRepository(Order);
    const enrollmentRepository = getRepository(Enrollment);

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
        "course.discountPrice",
      ])
      .where("order.id = :orderId", { orderId })
      .getOne();

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
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
  clearUserCart,
  getAllOrders,
  getOrderById,
};
