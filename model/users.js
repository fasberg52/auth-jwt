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
      enum: ["admin", "user"],
      default: "user",
    },
    imageUrl: {
      type: "varchar",
      nullable: true,
    },
    grade: {
      type: "varchar",
      nullable: true,
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
  relations: {
    orders: {
      type: "one-to-many",
      target: "Order",
      inverseSide: "user",
    },
  },
});

module.exports = User;
