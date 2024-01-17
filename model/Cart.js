// model/Cart.js

const { EntitySchema } = require("typeorm");
const Cart = new EntitySchema({
  name: "Cart",
  tableName: "cart",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    user: {
      target: "User",
      type: "many-to-one",
      inverseSide: "cart",
    },
    coupon: {
      type: "one-to-many",
      target: "Coupon",
      inverseSide: true,
    },
  },
});

module.exports = Cart;
