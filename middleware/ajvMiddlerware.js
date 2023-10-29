// validationMiddleware.js

const { phoneValidator, otpValidator,persianNameValidator } = require("../utils/ajv");

function validateLoginUsers(req, res, next) {
  const valid = phoneValidator(req.body);
  if (valid) {
    next();
  } else {
    res.status(400).json({
      error: "فرمت شماره همراه اشتباه است",
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
      error: "ارقام رمز یکبار مصرف صحیح نیست",
      errors: otpValidator.errors[0].message
      ,
    });
  }
}

function validateName(req, res, next) {
  const valid = persianNameValidator(req.body);
  if (valid) {
    next();
  } else {
    res.status(400).json({
      error: "لطفا کیبورد خود را فارسی کنید",
      errors: persianNameValidator.errors[0].message,
    });
  }
}


module.exports = {
  validateLoginUsers,
  validateOTP,
  validateName
  
  // Other validation functions
};


