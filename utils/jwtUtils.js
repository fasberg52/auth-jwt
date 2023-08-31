// jwtUtils.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(user) {
  return jwt.sign(
    { sub: user.id, lastLogin: user.lastLogin },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
    }
  );
}

module.exports = { createToken };