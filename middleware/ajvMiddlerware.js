// validationMiddleware.js

const  loginUsersValidator  = require('../utils/ajv');

function validateLoginUsers(req, res, next) {
  const valid = loginUsersValidator(req.body);
  if (valid) {
    next();
  } else {
    res.status(400).json({ error: 'فرمت شماره همراه اشتباه است', errors: loginUsersValidator.errors[0].message });
  }
}

// Other validation functions for different routes

module.exports = {
  validateLoginUsers,
  // Other validation functions
};
