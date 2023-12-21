const Users = require("../model/users");
const Order = require("../model/Orders");
const { getManager } = require("typeorm");
const logger = require("../services/logger");
const moment = require("jalali-moment");
const { convertToJalaliDate } = require("../services/jalaliService");
const User = require("../model/users");

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
    logger.error;
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getUsers(req, res) {
  try {
    const userRepository = getManager().getRepository(Users);
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    const searchInput = req.query.search;
    const role = req.query.roles;

    const queryBuilder = userRepository
      .createQueryBuilder("user")
      .select([
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.phone",
        "user.roles",
        "user.grade",
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
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while getting the users." });
  }
}

async function getUserByPhone(req, res) {
  try {
    const userRepository = getManager().getRepository(Users);
    const phoneNumber = req.params.phone;

    const existingUser = await userRepository.findOne({
      where: { phone: phoneNumber },
    });

    if (existingUser) {
      const userWithJalaliDates = {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        phone: existingUser.phone,
        role: existingUser.roles,
        imageUrl: existingUser.imageUrl,
        grade: existingUser.grade,
        createdAt: moment(existingUser.createdAt).format("jYYYY/jMMMM/jDD"),
        updatedAt: moment(existingUser.updatedAt).format("jYYYY/jMMMM/jDD"),
        lastLogin: existingUser.lastLogin
          ? moment(existingUser.lastLogin).format("jYYYY/jMMMM/jDD")
          : null,
      };

      res.json(userWithJalaliDates);
    } else {
      res.status(404).json({ error: "کاربری با این شماره پیدا نشد" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateUsers(req, res) {
  try {
    const { firstName, lastName, phone, password, roles, imageUrl, grade } =
      req.body;
    const userRepository = getManager().getRepository(Users);

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
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteUsers(req, res) {
  try {
    const phone = req.params.phone;

    await getManager().transaction(async (transactionalEntityManager) => {
      const user = await transactionalEntityManager.findOne(Users, {
        where: { phone: phone },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await transactionalEntityManager
        .createQueryBuilder()
        .update(Order)
        .set({ user: null })
        .where("user.phone = :phone", { phone: phone })
        .execute();

      // Delete the user
      await transactionalEntityManager.remove(Users, user);

      return res.json({ message: "User deleted successfully" });
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the user." });
  }
}

module.exports = {
  getUsers,
  getUserByPhone,
  updateUsers,
  deleteUsers,
  createUser,
};
