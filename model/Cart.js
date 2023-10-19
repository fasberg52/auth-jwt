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
  },
  relations: {
    user: {
      target: "User",
      type: "many-to-one",
      inverseSide: "cart",
    },
    course:{
        target:"Course",
        type:"many-to-one",
        inverseSide:"cart"
    }
  },
});

module.exports = Cart;
