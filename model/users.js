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
    updatedAt: {
      type: "timestamp",
      onUpdate: "CURRENT_TIMESTAMP",
      nullable: true,
    },
    lastLogin: {
      type: "timestamp",
      nullable: true,
    },
    skuTest: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    uploads: {
      type: "one-to-one",
      target: "Upload",
      cascade: true,
      nullable: true,
      onDelete: "SET NULL",
    },
    orders: {
      type: "one-to-many",
      target: "Order",
      inverseSide: "user",
    },
    subscribe: {
      type: "many-to-many",
      target: "Subscribe",
      inverseSide: "user",
    },
  },
});

module.exports = User;
