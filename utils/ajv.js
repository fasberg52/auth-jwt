const Ajv = require("ajv");
const ajv = new Ajv(); 

const loginUsersSchema = {
  type: "object",
  properties: {
    phone: { type: "string", pattern: "^09\\d{9}$" },
    password: { type: "string" },
  },
  required: ["phone", "password"],
};
const loginUsersValidator = ajv.compile(loginUsersSchema);

module.exports = loginUsersValidator;
