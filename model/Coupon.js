const { typeorm, EntitySchema } = require("typeorm");

const Coupon = new EntitySchema({
  name: "Coupon",
  tableName: "coupons",
  columns: {
    id: {
      type: "id",
      primary: true,
      generated: true,
    },
    code: {
      type: "text",
      unique: true,
    },
    discountPersentage: {
      type: "int",
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
    },
    expireTime: {
      type: "timestamp",
    },
  },
});

module.exports = Coupon;
