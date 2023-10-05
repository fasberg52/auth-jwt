// OrderItem.js

const { EntitySchema } = require("typeorm");
const Product = require("./Product");
const Order = require("./Order");

const OrderItemSchema = new EntitySchema({
  name: "OrderItem",
  tableName: "order_items",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    quantity: {
      type: "int",
    },
    pricePerUnit: {
      type: "int",
    },
    totalPrice: {
      type: "int",
    },
    createdAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    lastModified: {
      type: "timestamp",
      onUpdate: "CURRENT_TIMESTAMP",
    },
      },
  relations: {
    product: {
      target: Product,
      type: "many-to-one",
      inverseSide: "orderItems",
    },
    order: {
      target: Order,
      type: "many-to-one",
      inverseSide: "orderItems",
    },
  },
});

module.exports = OrderItemSchema;
