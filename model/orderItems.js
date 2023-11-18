const { EntitySchema } = require("typeorm");

const OrderItem = new EntitySchema({
  name: "OrderItem",
  tableName: "orderItems",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    orderId: {
      type: "int",
    },
    courseId: {
      type: "int",
    },
    quantity: {
      type: "int",
    },
  },
});

module.exports = OrderItem
