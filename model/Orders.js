//model/Orders.js
const { EntitySchema } = require("typeorm");
const User = require("./users");

const Order = new EntitySchema({
  name: "Order",
  tableName: "orders",
  columns: {
    id: {
      type: "int",
      generated: true,
      primary: true,
    },

    orderDate: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    orderStatus: {
      type: "enum",
      enum: ["pending", "cancelled", "success"],
      nullable: true,
    },
    totalPrice: {
      type: "int",
    },
    refId: {
      type: "varchar",
      nullable: true,
    },
    userPhone: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    user: {
      target: User,
      type: "many-to-one",
      joinColumn: true,
    },
    orderItems: {
      type: "one-to-many",
      target: "OrderItem",
      inverseSide: "order",
    },
  },
});

module.exports = Order;
