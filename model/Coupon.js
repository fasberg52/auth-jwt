const { typeorm, EntitySchema } = require("typeorm");

const Coupon = new EntitySchema({
  name: "Coupon",
  tableName: "coupons",
  columns: {
    id: {
      type: "int",
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
      createDate: true,
    },
    expireTime: {
      type: "timestamp",
      nullable: true,
    },
  },
});

module.exports = Coupon;
