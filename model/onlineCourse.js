const { EntitySchema } = require("typeorm");
const OnlineClass = new EntitySchema({
  name: "OnlineClass",
  tableName: "onlineClass",
  columns: {
    id: {
      type: "int",
      generated: true,
      primary: true,
    },
    startDate: {
      type: "timestamp",
    },
    endDate: {
      type: "timestamp",
    },
    title: {
      type: "varchar",
    },
    courseId: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    course: {
      type: "many-to-one",
      target: "Course",
      inverseSide: "onlineClasses",
      joinColumn: { name: "courseId", referencedColumnName: "id" },
    },
  },
});

module.exports = OnlineClass;