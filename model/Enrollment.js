//model/Enrollment.js

const { EntitySchema } = require("typeorm");

const Enrollment = new EntitySchema({
  name: "Enrollment",
  tableName: "enrollments",
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
      joinColumn: { name: "orderId", referencedColumnName: "id" }, 
    },
    course: {
      target: "Course",
      type: "many-to-one",
      inverseSide: "enrollments",
      joinColumn: { name: "courseId", referencedColumnName: "id" },
    },
  },
});

module.exports = Enrollment;
