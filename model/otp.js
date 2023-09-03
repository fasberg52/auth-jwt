//OTP.js
const { EntitySchema } = require("typeorm");
const User = require("./users");

const OTP = new EntitySchema({
  name: "OTP",
  tableName: "otp",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    phone: {
      type: "text",
    },
    otp: {
      type: "varchar",
    },
    isVerified: {
      type: "boolean",
      default: false,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "phone",
        referencedColumnName: "phone",
      },
    },
  },
});

module.exports = OTP;
