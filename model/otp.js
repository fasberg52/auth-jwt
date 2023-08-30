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
    otpCode: {
      type: "varchar",
    },
    isVerified: {
      type: "boolean",
      default: false,
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
  },
});

module.exports = OTP;
