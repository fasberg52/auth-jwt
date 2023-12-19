// jwtUtils.js
const jwt = require("jsonwebtoken");
const User = require("../model/users");

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      lastLogin: user.lastLogin,
      phone: user.phone,
      role: user.roles,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "72h",
    }
  );
}

function verifyAndDecodeToken(token) {
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken;
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return null;
  }
}

module.exports = { createToken, verifyAndDecodeToken };
