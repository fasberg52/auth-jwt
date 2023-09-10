const { EntitySchema } = require("typeorm");
const Course = new EntitySchema({
  id: {
    type: "int",
    generated: true,
  },
  title: {
    type: "varchar",
  },
  description: {
    type: "varchar",
  },
  price: {
    type: "number",
  },
  imageUrl: {
    type: "string",
  },
  videoUrl: {
    type: "string",
  },
  createdAt: {
    type: "timestamp",
    createDate: true,
  },
  relations: {
    users: {
      type: "many-to-many",
      target: "User", // Reference the User entity
      joinTable: {
        name: "user_courses", // The name of the intermediary table
        joinColumn: { name: "courseId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "userId", referencedColumnName: "id" },
      },
    },
  },
});

module.exports = Course;
