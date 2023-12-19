const User = require("../model/users");
const jwt = require("jsonwebtoken");

const { getManager } = require("typeorm");
const logger = require("../services/logger");
const moment = require("jalali-moment");
const { convertToJalaliDate } = require("../services/jalaliService");

const { verifyAndDecodeToken } = require("../utils/jwtUtils");

async function getUserDataWithToken(req, res) {
    try {
      const userRepository = getManager().getRepository(User);
      const token = req.headers.authorization;
      console.log("Received Token:", token);
  
      // Assuming you have a function to verify and decode the token
      const decodedToken = verifyAndDecodeToken(token);
      console.log("Decoded Token:", decodedToken);
  
      if (!decodedToken || !decodedToken.phone) {
        return res.status(401).json({ error: "Invalid or missing token" });
      }
  
      const phone = decodedToken.phone;
  
      const existingUser = await userRepository.findOne({ phone });
  
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
  

module.exports = {
  getUserDataWithToken,
};
