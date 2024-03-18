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
    quantity: {
      type: "int",
    },
    cartId: {
      type: "int",
    },
    courseId: {
     
      type: "int",
    },
  },
  relations: {
    cart: {
      target: "Cart",
      type: "many-to-one",
      inverseSide: "cartItems",
      joinColumn: { name: "cartId", referencedColumnName: "id" },
    },
    course: {
      target: "Course",
      type: "many-to-one",
      inverseSide: "cartItems",
      joinColumn: { name: "courseId", referencedColumnName: "id" },
    },
  },
});

module.exports = CartItems;
