const Ajv = require("ajv").default;
const ajv = new Ajv({ allErrors: true });
require("ajv-errors")(ajv);
const phoneSchema = {
  type: "object",
  properties: {
    phone: { type: "string", pattern: "^09\\d{9}$" },
  },
  required: ["phone"],
};

const otpSchema = {
  type: "object",
  properties: {
    otp: { type: "string", pattern: "^[0-9]{5}$" },
  },
  required: ["otp"],
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
const otpValidator = ajv.compile(otpSchema);
const signUpValidator = ajv.compile(signUpSchema);

module.exports = {
  phoneValidator,
  otpValidator,
  signUpValidator,
};
