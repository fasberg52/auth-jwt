//model/Coupon.js
const { EntitySchema } = require("typeorm");

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
      type: "varchar",
      unique: true,
      nullable:true
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
  relations: {
    carts: {
      type: "many-to-one",
      target: "Cart",
      joinColumn: true,
    },
  },
});

module.exports = Coupon;
