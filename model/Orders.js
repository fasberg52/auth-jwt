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
    cartId: {
      type: "int",
      nullable: true,
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
    cart: {
      type: "one-to-one",
      target: "Cart",
      joinColumn: true,
    },
    user: {
      target: User,
      type: "many-to-one",
      inverseSide: "orders",
    },
  },
});

module.exports = Order;
