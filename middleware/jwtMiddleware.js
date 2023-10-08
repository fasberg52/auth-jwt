//jwtAuthMiddleware.js
const passport = require('passport');




// Middleware to handle JWT authentication
const jwtAuthMiddleware = passport.authenticate('jwt', { session: false });

module.exports = { jwtAuthMiddleware };