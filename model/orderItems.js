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
      nullable: true,
    },
    courseId: {
      type: "int",
    },
    quantity: {
      type: "int",
    },
  },
  relations: {
    order: {
      type: "many-to-one",
      target: "Order",
      joinColumn: true,
      joinColumn: { name: "orderId", referencedColumnName: "id" }, // Join column details
    },
  },
});

module.exports = OrderItem;
