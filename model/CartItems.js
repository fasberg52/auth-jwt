// model/cartItems
const { EntitySchema } = require("typeorm");

const CartItems = new EntitySchema({
  name: "CartItems",
  tableName: "cartItems",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    quantity:{
      type:"int"
    },

  },
  relations: {
    cart: {
      target: "Cart",
      type: "many-to-one",
      inverseSide: "cartItems",
    },
    course: {
      target: "Course",
      type: "many-to-one",
      inverseSide: "cartItems",
    },
  },
});

module.exports = CartItems;
