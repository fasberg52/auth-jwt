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
    paymentType: {
      type: "enum",
      enum: ["zp", "cbc", "hand"],//zarinpal, cart by cart, hand
      nullable: true,
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
      type: "many-to-one",
      target: User,

      joinColumn: { name: "userPhone", referencedColumnName: "phone" },
    },
    enrollments: {
      type: "one-to-many",
      target: "Enrollment",
      inverseSide: "order",
    },
  },
});

module.exports = Order;
