//jwtAuthMiddleware.js
const passport = require('passport');
const jwt = require('jsonwebtoken');

const token = process.env.JWT_SECRET;
try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    console.log(decoded);
  } catch (error) {
    console.error('JWT verification error:', error);
  }

// Middleware to handle JWT authentication
const jwtAuthMiddleware = passport.authenticate('jwt', { session: false });

module.exports = { jwtAuthMiddleware };