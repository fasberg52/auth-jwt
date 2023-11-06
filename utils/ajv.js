const Ajv = require("ajv").default;
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
const phoneSchema = {
  type: "object",
  properties: {
    phone: { type: "string", pattern: "^09\\d{9}$" },
  },
  required: ["phone"],
  errorMessage: {
    properties: {
      phone: "فرمت شماره همراه صحیح نیست",
    },
  },
};

const loginWithOTPSchema = {
  type: "object",
  properties: {
    phone: { type: "string", pattern: "^09\\d{9}$" },

    otp: { type: "string", pattern: "^[0-9]{5}$" },
  },
  required: ["otp", "phone"],
  errorMessage: {
    properties: {
      phone: "فرمت شماره همراه صحیح نیست",
      otp: "رمز یکبار مصرف را 5 رقم وارد کنید",
    },
  },
};
const signUpSchema = {
  type: "object",
  properties: {
    firstName: { type: "string", pattern: "^[آ-ی ]+$" },
    lastName: { type: "string", pattern: "^[آ-ی ]+$" },
    phone: { type: "string", pattern: "^09\\d{9}$" },

    password: {
      type: "string",
      pattern: "^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$",
      minLength: 5,
    },
  },
  required: ["firstName", "lastName"],

  errorMessage: {
    properties: {
      firstName: "نام خود را فارسی وارد کنید",
      lastName: "فامیل خود را فارسی وارد کنید",
      phone: "فرمت شماره همراه صحیح نیست",
      password: "لطفا ترکیبی از حروف و اعداد وارد کنید",
    },
  },
};

const phoneValidator = ajv.compile(phoneSchema);
const loginWithOTPValidator = ajv.compile(loginWithOTPSchema);
const signUpValidator = ajv.compile(signUpSchema);

module.exports = {
  phoneValidator,
  loginWithOTPValidator,
  signUpValidator,
};
