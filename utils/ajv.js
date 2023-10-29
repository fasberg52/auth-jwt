const Ajv = require("ajv");
const ajv = new Ajv();

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
const persianNameSchema = {
  type: "object",
  properties: {
    firstName: { type: "string", pattern: "^[آ-ی ]+$" },
    lastName: { type: "string", pattern: "^[آ-ی ]+$" },
    password: {
      type: "string",
      pattern: "^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$",
      minLength: 5,
    },
  },
  required: ["firstName", "lastName"],
};

const phoneValidator = ajv.compile(phoneSchema);
const otpValidator = ajv.compile(otpSchema);
const persianNameValidator = ajv.compile(persianNameSchema);

module.exports = {
  phoneValidator,
  otpValidator,
  persianNameValidator,
};
