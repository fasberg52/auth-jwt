const User = require("../model/users");
const Order = require("../model/Orders");

const jwt = require("jsonwebtoken");

const { getManager } = require("typeorm");
const logger = require("../services/logger");
const moment = require("jalali-moment");
const { convertToJalaliDate } = require("../services/jalaliService");

const { verifyAndDecodeToken } = require("../utils/jwtUtils");

async function getUserDataWithToken(req, res) {
  try {
    const userRepository = getManager().getRepository(User);
    const token = req.body.token;
    console.log("Received Token:", token);

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const decodedToken = verifyAndDecodeToken(token);
    console.log("Decoded Token:", decodedToken);

    if (!decodedToken || !decodedToken.phone) {
      return res.status(401).json({ error: "Invalid or missing token" });
    }

    const phone = decodedToken.phone;

    const existingUser = await userRepository.findOne({
      where: { phone: phone },
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
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllOrderUser(req, res) {
  try {
    const userRepository = getManager().getRepository(User);

    const token = req.body.token;
    console.log("Received Token:", token);

    if (!token) {
      return res.status(401).json({ error: "توکن وجود ندارد" });
    }

    const decodedToken = verifyAndDecodeToken(token);
    console.log("Decoded Token:", decodedToken);

    if (!decodedToken || !decodedToken.phone) {
      return res.status(401).json({ error: "توکن اشتباه است" });
    }

    const phone = decodedToken.phone;

    const user = await userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.orders", "orders")
      .where("user.phone = :phone", { phone })
      .getOne();

    if (!user) {
      return res.status(404).json({ error: "کاربری پیدا نشد" });
    }

    return res.status(200).json({ orders: user.orders, status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function editDataUser(req, res) {
  try {
    const userRepository = getManager().getRepository(User);

    const token = req.body.token;
    console.log("Received Token:", token);

    if (!token) {
      return res.status(401).json({ error: "توکن وجود ندارد" });
    }

    const decodedToken = verifyAndDecodeToken(token);
    console.log("Decoded Token:", decodedToken);

    if (!decodedToken || !decodedToken.phone) {
      return res.status(401).json({ error: "توکن اشتباه است" });
    }

    const phone = decodedToken.phone;

    const user = await userRepository.findOne({
      where: { phone },
    });

    if (!user) {
      return res.status(404).json({ error: "کاربری پیدا نشد" });
    }

    if (req.body.firstName) {
      user.firstName = req.body.firstName;
    }

    if (req.body.lastName) {
      user.lastName = req.body.lastName;
    }
    if (req.body.imageUrl) {
      user.imageUrl = req.body.imageUrl;
    }

    if (req.body.grade) {
      user.grade = req.body.grade;
    }

    await userRepository.save(user);

    const response = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.roles,
      imageUrl: user.imageUrl,
      grade: user.grade,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({ message: "با موفقیت بروز شد", response, status: 200 });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
module.exports = {
  getUserDataWithToken,
  getAllOrderUser,
  editDataUser,
};
