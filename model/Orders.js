//model/Orders.js
const { EntitySchema } = require("typeorm");
const User = require("./users"); 

const Order = new EntitySchema({
  name: "Order",
  tableName: "orders",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    orderDate: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    orderStatus: {
      type: "enum",
      enum: ["pending", "cancelled", "success"],
    },
    totalPrice: {
      type: "int",
    },
  },
  relations: {
    user: {
      target: User,
      type: "many-to-one",
      inverseSide: "orders",
    },
  },
});

module.exports = Order;
