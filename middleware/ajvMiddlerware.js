// validationMiddleware.js

const {
  phoneValidator,
  loginWithOTPValidator,
  signUpValidator,
  partValidator,
  courseValidator,
  updateUserValidator,
  tokenValidator,
  subscribeValidator,
} = require("../utils/ajv");

function validSubscribe(req, res, next) {
  const valid = subscribeValidator(req.body);
  if (valid) {
    next();
  } else {
    res.status(400).json({
      errors: subscribeValidator.errors[0].message,
    });
  }
}

function validToken(req, res, next) {
  const valid = tokenValidator(req.body);
  if (valid) {
    next();
  } else {
    res.status(400).json({
      errors: tokenValidator.errors[0].message,
    });
  }
}

function validUpdateUser(req, res, next) {
  const valid = updateUserValidator(req.body);
  if (valid) {
    next();
  } else {
    res.status(400).json({
      errors: updateUserValidator.errors[0].message,
    });
  }
}

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
  validUpdateUser,
  validToken,
  validSubscribe,
  // Other validation functions
};
