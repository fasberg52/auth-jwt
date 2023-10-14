const Ajv = require("ajv");
const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

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
