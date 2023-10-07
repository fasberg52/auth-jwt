// users Entity

const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      type: "int",
      generated: true,
    },
    firstName: {
      type: "varchar",
    },
    lastName: {
      type: "varchar",
    },
    phone: {
      type: "text",
      primary: true,
    },
    password: {
      type: "text",
    },
    roles: {
      type: "enum",
      enum: ["admin", "user"], // Use the enum-like values
      default: "user",
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    lastLogin: {
      type: "timestamp",
      nullable: true,
    },
  },
 
});

module.exports = User;
