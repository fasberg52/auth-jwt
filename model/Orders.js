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
      enum: ["pending", "cancelled", "success", "preInvoice"],
      nullable: true,
    },
    originalTotalPrice: {
      type: "int",
      nullable: true,
    },
    discountTotalPrice: {
      type: "int",
      nullable: true,
    },

    paymentType: {
      type: "enum",
      enum: ["online", "offline"],
      nullable: true,
      default: "online",
    },
    gatewayPay: {
      type: "enum",
      enum: ["zarinpal", "payping", "cbc"], //zarinpal, payping, cart by cart,
      default: "zarinpal",
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
    couponId: {
      type: "int",
      nullable: true,
    },
    cardPen: {
      type: "varchar",
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
    coupons: {
      type: "many-to-one",
      target: "Coupon",
      joinColumn: { name: "couponId", referencedColumnName: "id" },
    },
  },
});

module.exports = Order;
