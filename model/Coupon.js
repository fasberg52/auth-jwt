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
    },
    discountPersentage: {
      type: "int",
      nullable: true,
    },
  },
});

modules.exports = Coupon;
