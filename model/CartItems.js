const { EntitySchema } = require("typeorm");

const cartImtes = new EntitySchema({
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
    }
  },
  relationIds: {
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

module.exports = cartImtes;
