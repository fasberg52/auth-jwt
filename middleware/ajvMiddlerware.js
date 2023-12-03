// validationMiddleware.js

const {
  phoneValidator,
  loginWithOTPValidator,
  signUpValidator,
  partValidator,
  courseValidator,
} = require("../utils/ajv");

function validCourse(req, res, next) {
  const valid = courseValidator(req.body);
  if (valid) {
    next();
  } else {
    res.status(400).json({
      errors: courseValidator.errors[0].message,
    });
  }
}

function validParts(req, res, next) {
  const valid = partValidator(req.body);
  if (valid) {
    next();
  } else {
    res.status(400).json({
      errors: partValidator.errors[0].message,
    });
  }
}

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
  const valid = loginWithOTPValidator(req.body);
  if (valid) {
    next();
  } else {
    res.status(400).json({
      errors: loginWithOTPValidator.errors[0].message,
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
  validateSignUp,
  validParts,
  validCourse,

  // Other validation functions
};
