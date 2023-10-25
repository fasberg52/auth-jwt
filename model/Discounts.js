// Discount.js

const { EntitySchema } = require('typeorm');
const Product = require('./Product');
const Order = require('./Order');

const DiscountType = {
  PRODUCT: 'product', 
  FIXED_AMOUNT: 'fixed_amount', 
  ORDER: 'order', 
};

const DiscountSchema = new EntitySchema({
  name: 'Discount',
  tableName: 'discounts',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    type: {
      type: 'enum',
      enum: [DiscountType.PRODUCT, DiscountType.FIXED_AMOUNT, DiscountType.ORDER],
    },
    discountPercentage: {
      type: 'decimal',
      precision: 5,
      scale: 2,
      nullable: true, 
    },
    discountAmount: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: true, 
    },
    startDate: {
      type: 'timestamp',
    },
    endDate: {
      type: 'timestamp',
    },
  },
  relations: {
    product: {
      target: Product,
      type: 'many-to-one',
      inverseSide: 'discounts',
    },
    order: {
      target: Order,
      type: 'many-to-one',
      inverseSide: 'discounts',
    },
  },
});

module.exports = DiscountSchema;
