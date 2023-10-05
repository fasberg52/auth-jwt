// Discount.js

const { EntitySchema } = require('typeorm');
const Product = require('./Product');
const Order = require('./Order');

// Discount Types Enum
const DiscountType = {
  PRODUCT: 'product', // Discount applied to a product
  FIXED_AMOUNT: 'fixed_amount', // Fixed amount discount code
  ORDER: 'order', // Discount applied to the entire order
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
      nullable: true, // For product-level discounts and order-level discounts
    },
    discountAmount: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: true, // For fixed amount discounts
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
