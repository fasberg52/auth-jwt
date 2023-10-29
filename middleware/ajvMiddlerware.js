// validationMiddleware.js

const { phoneValidator, otpValidator,signUpValidator } = require("../utils/ajv");

function validateLoginUsers(req, res, next) {
  const valid = phoneValidator(req.body);
  if (valid) {
    next();
  } else {
    res.status(400).json({
      errors: phoneValidator.errors[0].message,
    });
  }
}

// Other validation functions for different routes
function validateOTP(req, res, next) {
  const valid = otpValidator(req.body);
  if (valid) {
    next();
  } else {
    res.status(400).json({
      errors: otpValidator.errors[0].message
      ,
    });
  }
}

function validateSignUp(req, res, next) {
  const valid = signUpValidator(req.body);
  if (valid) {
    next();
  } else {
    res.status(400).json({
      errors: signUpValidator.errors[0].message,
    });
  }
}


module.exports = {
  validateLoginUsers,
  validateOTP,
  validateSignUp
  
  // Other validation functions
};


