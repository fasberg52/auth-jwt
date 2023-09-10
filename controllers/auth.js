const Users = require("../model/users");
const OTP = require("../model/OTP");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const {sendOTP , verifyOTP} = require("../services/otpService");
const { getManager } = require("typeorm");
const { generateNumericOTP } = require("../utils/otpUtils");
const { createToken } = require("../utils/jwtUtils");
const jwt = require("jsonwebtoken");
const { sendOTPSMS } = require("../utils/authUtils");

require("dotenv").config();

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET, // Set your JWT secret here
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
  // Serialize user to store in session
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
// Create a JWT token

async function loginUsers(req, res) {
  try {
    // const otp = generateNumericOTP(6);

    const userRepository = getManager().getRepository(Users);
    const verifyUser = await userRepository.findOne({
      where: { phone: req.body.phone },
    });

    if (!verifyUser) {
      res.status(404).json({ error: "Phone number not found" });
    } else {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        verifyUser.password
      );

      if (!passwordMatch) {
        res.status(401).json({ error: "Invalid password" });
        return;
      }

      verifyUser.lastLogin = new Date(); // Update last login time
      //sendOTPSMS(req.body.phone, otp); // Send OTP via SMS

      await userRepository.save(verifyUser);

      const token = createToken(verifyUser);

      res.json({ token, username: verifyUser.phone, role: verifyUser.roles });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while logging in." });
  }
}
async function loginWithOTP(req, res) {
  try {
    const { phone } = req.body;
    const userRepository = getManager().getRepository(Users);
    const existingUser = await userRepository.findOne({
      where: { phone: phone },
    });
    if (!existingUser) {
      res.status(404).json({ error: "Phone number not found" });
    }
    //const otp = generateNumericOTP(6).toString();
    //console.log(otp);
    //const otpRepository = getManager().getRepository(OTP);
   // const hashedPassword = await bcrypt.hash(otp, 10);
    //const expirationTime = new Date(Date.now() + 30000); // 30 seconds from now
    // const newOTP = otpRepository.create({
    //   phone,
    //   otp: hashedPassword,
    //   // expirationTime,
    // });
    

    //await otpRepository.save(newOTP);
    sendOTP(phone); // Send OTP via SMS
    res.json({ message: "otp send youre phone successfully" });
  } catch (error) {
   
    res.status(500).json({ error: "An error occurred while loginWithOTP in." });
  }
}
async function verifyWithOTP(req, res) {
  try {
    const { phone, otp } = req.body;
    const userRepository = getManager().getRepository(Users);

    const isValidOTP = await verifyOTP(phone, otp);
    if (!isValidOTP) {
      res.status(401).json({ error: "Invalid OTP" });
      return;
    }

    const existingUser = await userRepository.findOne({
      where: { phone: phone },
    });
    if (!existingUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    existingUser.lastLogin = new Date(); // Update last login time
    await userRepository.save(existingUser);

    const token = createToken(existingUser);
    res.json({ token, username: existingUser.phone });
  } catch (error) {

    res.status(500).json({ error: "An error occurred while verifyWithOTP in." });
  }
}
async function signUpUsers(req, res) {
  try {
    const userRepository = getManager().getRepository(Users);
    const existingUser = await userRepository.findOne({
      where: { phone: req.body.phone },
    });

    if (existingUser) {
      res.status(400).json({ error: "User already exists." });
    } else {
      const otp = generateNumericOTP(6);
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = userRepository.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        password: hashedPassword,
        otp: otp,
      });

      // Send OTP via SMS
      otpService.sendOTP(req.body.phone, otp);

      const savedUser = await userRepository.save(newUser);
      res.json(savedUser);
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the user." });
  }
}

module.exports = {
  loginUsers,
  loginWithOTP,
  verifyWithOTP,
  signUpUsers,
};
