const Users = require("../model/users");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { getManager } = require("typeorm");

const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET, // Set your JWT secret here
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const userRepository = getManager().getRepository(Users);
      const user = await userRepository.findOne(jwtPayload.sub);

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
// Create a JWT token
function createToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: "24h", // Set token expiration as needed
  });
}

async function loginUsers(req, res) {
  try {
    const userRepository = getManager().getRepository(Users);
    const verifyUser = await userRepository.findOne({
      where: { phone: req.body.phone, password: req.body.password },
    });
    if (!verifyUser) {
      res.status(404).json({ error: "phone or password not true" });
    } else {
      const token = createToken(verifyUser);

      res.json({ token, username: verifyUser.phone });
      console.log(`req header : ${JSON.stringify(req.headers)}`)
    }
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the user." });
  }
}

async function postUsers(req, res) {
  try {
    const userRepository = getManager().getRepository(Users);
    const existingUser = await userRepository.findOne({
      where: { phone: req.body.phone },
    });

    if (existingUser) {
      res.status(400).json({ error: "User already exists." });
    } else {
      const newUser = userRepository.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        password: req.body.password,
      });

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

async function getUsers(req, res) {
  try {
    const userRepository = getManager().getRepository(Users);
    const users = await userRepository.find();
    res.json(users);
    console.log("Request Headers:", req.headers);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "An error occurred while getting users." });
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
      res.json(existingUser);
    } else {
      res.status(404).json({ error: "User not found." });
    }
  } catch (error) {
    console.error("Error getting user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while getting the user." });
  }
}

async function updateUsers(req, res) {
  try {
    const userRepository = getManager().getRepository(Users);
    const phoneNumber = req.params.phone;

    const existingUser = await userRepository.findOne({
      where: { phone: phoneNumber },
    });

    if (existingUser) {
      existingUser.firstName = req.body.firstName;
      existingUser.lastName = req.body.lastName;
      existingUser.password = req.body.password;

      const savedUser = await userRepository.save(existingUser);
      res.json(savedUser);
    } else {
      res.status(404).json({ error: "User not found." });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the user." });
  }
}

async function deleteUsers(req, res) {
  try {
    const userRepository = getManager().getRepository(Users);
    const phoneNumber = req.params.phone;

    const existingUser = await userRepository.findOne({
      where: { phone: phoneNumber },
    });

    if (existingUser) {
      await userRepository.remove(existingUser);
      res.json({ message: "User deleted successfully." });
    } else {
      res.status(404).json({ error: "User not found." });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the user." });
  }
}

module.exports = {
  loginUsers,
  getUsers,
  getUserByPhone,
  postUsers,
  updateUsers,
  deleteUsers,
};
