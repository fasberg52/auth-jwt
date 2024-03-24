const { getManager, getRepository } = require("typeorm");
const User = require("../model/users");
const Order = require("../model/Orders");
const Enrollment = require("../model/Enrollment");
const Cart = require("../model/Cart");
const Subscribe = require("../model/Subscribe")
const { quiz24Url } = require("../utils/axiosBaseUrl");
const logger = require("../services/logger");
const moment = require("jalali-moment");
const { convertToJalaliDate } = require("../services/jalaliService");

async function createUser(req, res) {
  try {
    const { firstName, lastName, phone, password, roles, imageUrl, grade } =
      req.body;

    const userRepository = getManager().getRepository(User);
    const existingUser = await userRepository.findOne({
      where: { phone: phone },
    });
    if (existingUser) {
      return res.status(400).json({
        message: "کاربر دیگری با این شماره وجود دارد",
        status: 400,
      });
    }
    const newUser = userRepository.create({
      firstName,
      lastName,
      phone,
      password,
      roles,
      imageUrl,
      grade,
    });

    const savedUser = await userRepository.save(newUser);
    savedUser.createdAt = convertToJalaliDate(savedUser.createdAt);
    res
      .status(201)
      .json({ message: "کاربر جدید ایجاد شد", savedUser, status: 201 });
  } catch (error) {
    logger.error(`Error in createUser ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getUsers(req, res) {
  try {
    const userRepository = getManager().getRepository(User);
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    const searchInput = req.query.search;
    const role = req.query.roles;

    if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1) {
      return res.status(400).json({ error: "صفحه مورد نظر وجود ندارد" });
    }

    const totalUsersCount = await userRepository.count();

    const totalPages = Math.ceil(totalUsersCount / pageSize);

    if (page > totalPages) {
      return res
        .status(400)
        .json({ error: `بیشتر از ${totalPages} صفحه نداریم` });
    }

    const queryBuilder = userRepository
      .createQueryBuilder("user")
      .select([
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.phone",
        "user.roles",
        "user.grade",
        "user.lastLogin",
      ])
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy("user.id", "DESC");

    if (searchInput) {
      queryBuilder
        .where(
          "CONCAT(user.firstName, ' ', user.lastName) ILIKE :searchInput",
          {
            searchInput: `%${searchInput}%`,
          }
        )
        .orWhere("user.phone ILIKE :searchInput", {
          searchInput: `%${searchInput}%`,
        });
    }

    if (role) {
      queryBuilder.andWhere("user.roles = :role", { role });
    }

    const [users, totalUsers] = await queryBuilder.getManyAndCount();

    const usersCount = await userRepository
      .createQueryBuilder("user")
      .select("COUNT(user.id)", "count")
      .where("user.roles = :role", { role: "user" })
      .getRawOne();

    const adminsCount = await userRepository
      .createQueryBuilder("user")
      .select("COUNT(user.id)", "count")
      .where("user.roles = :role", { role: "admin" })
      .getRawOne();

    res.json({
      users,
      totalUsers: totalUsers,
      adminsCount: adminsCount.count,
      usersCount: usersCount.count,
    });
  } catch (error) {
    logger.error(`Error in getUser ${error}`);

    res
      .status(500)
      .json({ error: "An error occurred while getting the users." });
  }
}

async function getUserByPhone(req, res) {
  try {
    const userRepository = getManager().getRepository(User);
    const phoneNumber = req.params.phone;

    const existingUser = await userRepository.findOne({
      where: { phone: phoneNumber },
    });

    if (existingUser) {
      const information = {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        phone: existingUser.phone,
        role: existingUser.roles,
        imageUrl: existingUser.imageUrl,
        grade: existingUser.grade,
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt,
      };

      res.json(information);
    } else {
      res.status(404).json({ error: "کاربری با این شماره پیدا نشد" });
    }
  } catch (error) {
    logger.error(`Error in getUserByPhone ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateUsers(req, res) {
  try {
    const { firstName, lastName, phone, password, roles, imageUrl, grade } =
      req.body;
    const userRepository = getManager().getRepository(User);

    const existingUser = await userRepository.findOne({
      where: { phone: phone },
    });

    if (!existingUser) {
      res.status(404).json({ error: "کاربر وجود ندارد" });
    } else {
      Object.assign(existingUser, {
        firstName,
        lastName,
        password,
        roles,
        imageUrl,
        grade,
      });

      const savedUser = await userRepository.save(existingUser);
      res
        .status(200)
        .json({ message: "تغییرات انجام شد", savedUser, status: 200 });
    }
  } catch (error) {
    logger.error(`error in updateUser ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function delUser(req, res) {
  try {
    const phone = req.body.phone;

    const userRepository = getManager().getRepository(User);
    const del = await userRepository.findOne({ where: { phone: phone } });

    if (del) {
      await userRepository.remove(del);
      res.status(200).json({ message: "کاربر پاک شد" });
    } else {
      res.status(404).json({ error: "کاربر ای پیدا نشد" });
    }
  } catch (error) {
    logger.error(`error in delUser ${error}`);
    res.status(500).json({ error: "EROOOOOOOOOOR" });
  }
}

async function deleteUsers(req, res) {
  try {
    const phone = req.params.phone;
    const userId = process.env.ADMIN_QUEZ24;
    const userName = phone;
    const requestBody = { userName, userId };
    const userRepository = getManager().getRepository(User);

    console.log(`phone >> ${phone}`);

    const deleteUser = await userRepository.findOne({
      where: { phone: phone },
    });

    if (deleteUser) {
      await quiz24Url.post("/deleteStudent", requestBody);

      await getManager()
        .createQueryBuilder()
        .update(Cart)
        .set({ user: null })
        .where("user.phone = :phone", { phone: phone })
        .execute();

      await getManager()
        .createQueryBuilder()
        .update(Order)
        .set({ user: null })
        .where("user.phone = :phone", { phone: phone })
        .execute();

        await getManager()
        .createQueryBuilder()
        .delete()
        .from(Subscribe)
        .where("userPhone = :phone", { phone: phone })
        .execute();

      await userRepository.delete({ phone: phone });
      return res.json({ message: "کاربر با موفقیت پاک شد" });
    } else {
      return res.status(404).json({ error: "کاربری پیدا نشد" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "An error occurred while deleting the user." });
  }
}

async function addOrderUser(req, res) {
  try {
    const { orderStatus, userPhone, courseId } = req.body;

    // Create a new order record in the database
    const orderRepository = getManager().getRepository(Order);
    const newOrder = await orderRepository.create({
      orderStatus: orderStatus,
      userPhone: userPhone,
    });
    const savedOrder = await orderRepository.save(newOrder);

    // Retrieve the newly created order's ID
    const orderId = savedOrder.id;

    // Store the order ID and course ID in the enrollment table
    const enrollmentRepository = getManager().getRepository(Enrollment);
    const newEnrollment = await enrollmentRepository.create({
      orderId: orderId,
      courseId: courseId,
    });
    const savedEnrollment = await enrollmentRepository.save(newEnrollment);

    res.status(200).json({
      message: "Order and enrollment created successfully",
      orderId: orderId,
      enrollmentId: savedEnrollment.id,
    });
  } catch (error) {
    console.error(`Error in addOrderUser: ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getUsers,
  getUserByPhone,
  updateUsers,
  deleteUsers,
  createUser,
  delUser,
  addOrderUser
};
