const Users = require("../model/users");
const OTP = require("../model/OTP");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { sendOTP, verifyOTP } = require("../services/otpService");
const { getManager } = require("typeorm");
const { createToken } = require("../utils/jwtUtils");
const jwt = require("jsonwebtoken");
const logger = require("../services/logger");

require("dotenv").config();

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const userRepository = getManager().getRepository(Users);
      const user = await userRepository
        .createQueryBuilder("user")
        .where("user.id = :id", { id: jwtPayload.sub })
        .getOne();

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const userRepository = getManager().getRepository(Users);
    const user = await userRepository.findOne({ where: { id: id } });

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error);
  }
});

async function loginUsers(req, res) {
  try {
    // const otp = generateNumericOTP(6);

    const userRepository = getManager().getRepository(Users);
    const verifyUser = await userRepository.findOne({
      where: { phone: req.body.phone },
    });

    if (!verifyUser) {
      sendOTP(req.body.phone);
      const newUser = userRepository.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        password: req.body.password,
      });
      const savedUser = await userRepository.save(newUser);
      logger.info("User registered successfully");
      return res.json({ message: "User registered successfully" });
    }
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      verifyUser.password
    );

    if (!passwordMatch) {
      logger.info("Invalid password");

      res.status(401).json({ error: "Invalid password" });
      return;
    }

    verifyUser.lastLogin = new Date(); // Update last login time
    //sendOTPSMS(req.body.phone, otp); // Send OTP via SMS

    await userRepository.save(verifyUser);

    const token = createToken(verifyUser);
    logger.info(
      `token: ${token}, username: ${verifyUser.phone}, role: ${verifyUser.roles}`
    );
    res.json({ token, username: verifyUser.phone, role: verifyUser.roles });
  } catch (error) {
    logger.error("error in loginUser auth controller");
    res.status(500).json({ error: "An error occurred while logging in." });
  }
}
async function signUpUsers(req, res) {
  try {
    let user;
    const { phone } = req.body;
    const userRepository = getManager().getRepository(Users);
    const existingUser = await userRepository.findOne({ where: { phone } });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists." });
    }

    const otpRepository = getManager().getRepository(OTP);
    const existingOTP = await otpRepository.findOne({
      where: { phone: phone },
    });
    if (!existingOTP || !existingOTP.isVerified) {
      return res.status(401).json({
        message: "ابتدا شماره خود را با رمز یکبار مصرف تایید کنید",
        register: false,
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = userRepository.create({
      ...req.body,
      password: hashedPassword,
    });

    user = await userRepository.save(newUser);

    const token = createToken(user);
    res.status(200).json({
      message: "ثبت نام با موفقیت انجام شد",
      token,
      username: user.phone,
      register: true,
    }); // Sending a response for success  }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred while creating the user.",
      registred: true,
    });
  }
}
async function loginWithOTP(req, res) {
  try {
    const { phone } = req.body;
    const userRepository = getManager().getRepository(Users);
    const existingUser = await userRepository.findOne({
      where: { phone: phone },
    });

    if (existingUser) {
      res.json({
        message: "رمز یکبار مصرف ارسال شد",
        registred: false,
        login: true,
      });
      await sendOTP(phone);
    } else {
      await sendOTP(phone);
      console.log("user not found");

      res.json({
        message: "کاربری یافت نشد",
        registred: false,
        login: false,
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while logging in with OTP." });
  }
}

async function verifyWithOTP(req, res) {
  try {
    const { phone, otp } = req.body;
    const userRepository = getManager().getRepository(Users);

    const isValidOTP = await verifyOTP(phone, otp);

    if (!isValidOTP) {
      res.status(401).json({ error: "رمز یکبار مصرف اشتباه است" }); // Sending a response for invalid OTP
      return;
    }

    let user;
    const existingUser = await userRepository.findOne({
      where: { phone: phone },
    });

    if (!existingUser) {
      return res.status(201).json({
        message: " user not found but otp true",
        register: false,
        otp: true,
      });
      //   // User does not exist, create a new user
      //   const hashedPassword = await bcrypt.hash(req.body.password, 10);
      //   const newUser = userRepository.create({
      //     ...req.body,
      //     password: hashedPassword,
      //   });
      //   user = await userRepository.save(newUser);
    } else {
      //    User exists, update last login time
      existingUser.lastLogin = new Date();
      await userRepository.save(existingUser);
      user = existingUser;
    }

    const token = createToken(user);
    res.status(200).json({ token, username: user.phone }); // Sending a response for success
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while verifying OTP" });
  }
}

module.exports = {
  loginUsers,
  loginWithOTP,
  verifyWithOTP,
  signUpUsers,
};
