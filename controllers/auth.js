const Users = require("../model/users");
const OTP = require("../model/otp");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const crypto = require("crypto");
const otpGenerator = require("otp-generator");
const Kavenegar = require("kavenegar");
const { getManager } = require("typeorm");

const jwt = require("jsonwebtoken");
require("dotenv").config();

// This function generates an OTP
function generateOTP() {
  return otpGenerator.generate(6, {
    digits: true,
  });
}

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
  console.log(`user id : ${user.id}`);
});
passport.deserializeUser(async (id, done) => {
  console.log(`Deserializing user with ID: ${id}`);
  try {
    const userRepository = getManager().getRepository(Users);
    const user = await userRepository.findOne({ where: { id: id } });

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (error) {
    console.error(`Error deserializing user: ${error}`);
    done(error);
  }
});
// Create a JWT token
function createToken(user) {
  return jwt.sign(
    { sub: user.id, lastLogin: user.lastLogin },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h", // Set token expiration as needed
    }
  );
}

async function loginUsers(req, res) {
  try {
    const otp = generateNumericOTP(6);

    const userRepository = getManager().getRepository(Users);
    const verifyUser = await userRepository.findOne({
      where: { phone: req.body.phone, password: req.body.password },
    });
    if (!verifyUser) {
      res.status(404).json({ error: "phone or password not true" });
    } else {
      verifyUser.lastLogin = new Date(); // Update last login time
      const OtpApi = Kavenegar.KavenegarApi({
        apikey: process.env.KAVENEGAR_API_KEY,
      });
      OtpApi.VerifyLookup(
        {
          receptor: req.body.phone,
          token: otp,
          template: "verifyotp",
        },
        function (response, status) {
          console.log(response);
          console.log(status);
        }
      );

      await userRepository.save(verifyUser);

      const token = createToken(verifyUser);

      res.json({ token, username: verifyUser.phone, role: verifyUser.roles });
      console.log(`req header : ${JSON.stringify(req.headers)}`);
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the user." });
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
      const newUser = userRepository.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        password: req.body.password,
        otp: otp,
      });

      // Send OTP via SMS
      const OtpApi = Kavenegar.KavenegarApi({
        apikey: process.env.KAVENEGAR_API_KEY,
      });
      OtpApi.VerifyLookup(
        {
          receptor: req.body.phone,
          token: otp,
          template: "verifyotp",
        },
        function (response, status) {
          console.log(response);
          console.log(status);
        }
      );

      const savedUser = await userRepository.save(newUser);
      res.json(savedUser);
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the user." });
  }
}
function generateNumericOTP(length) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  loginUsers,

  signUpUsers,
};
