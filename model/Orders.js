const { EntitySchema } = require('typeorm');
const OrderItem = require('./OrderItem');
const User = require('./User'); // Assuming you have a User model

const OrderSchema = new EntitySchema({
  name: 'Order',
  tableName: 'orders',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    orderDate: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    orderStatus: {
      type: 'enum',
      enum:["pending", "cancelled", "succsess"]
    },
    totalPrice: {
        type: "int",
      },
  },
  relations: {
    user: {
      target: User,
      type: 'many-to-one',
      inverseSide: 'orders',
    },
    orderItems: {
      target: OrderItem,
      type: 'one-to-many',
      inverseSide: 'order',
    },
  },
});

module.exports = OrderSchema;
