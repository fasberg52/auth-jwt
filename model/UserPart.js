const { EntitySchema } = require("typeorm");

const UserPart = new EntitySchema({
  name: "UserPart",
  tableName: "user_parts",
  columns: {
    phone: {
      type: "text",
      primary: true,
    },
    partId: {
      type: "int",
      primary: true,
    },
    courseId: {
      type: "int",
      nullable: true,
    },
    isRead: {
      type: "boolean",
      default: false,
    },
    teachingRating: {
      type: "int",
      nullable: true,
      min: 1,
      max: 5,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "phone", referencedColumnName: "phone" },
    },
    part: {
      type: "many-to-one",
      target: "Part",
      joinColumn: { name: "partId", referencedColumnName: "id" },
    },
    course: {
      type: "many-to-one",
      target: "Course",
      joinColumn: { name: "courseId", referencedColumnName: "id" },
    },
  },
});

module.exports = UserPart;
