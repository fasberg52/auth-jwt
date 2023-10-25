// jwtUtils.js
const jwt = require("jsonwebtoken");
const User = require("../model/users");

function createToken(user) {
  return jwt.sign(
    { sub: user.id, lastLogin: user.lastLogin, phone: user.phone, role: user.roles },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
}

module.exports = { createToken };
