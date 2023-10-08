const { EntitySchema } = require('typeorm');
const Course = require('./Course');
const Order = require('./Orders');

const OrderItem = new EntitySchema({
  name: 'OrderItem',
  tableName: 'orderItems',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    quantity: {
      type: 'int',
    },
    pricePerUnit: {
      type: 'int',
    },
    totalPrice: {
      type: 'int',
    },
    createdAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    lastModified: {
      type: 'timestamp',
      onUpdate: 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    product: {
      target: Course,
      type: 'many-to-one',
      inverseSide: 'orderItems',
    },
    order: {
      target: Order,
      type: 'many-to-one',
      inverseSide: 'orderItems',
    },
  },
});

module.exports = OrderItem;
