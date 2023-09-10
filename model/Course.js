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
    courses: {
      type: "many-to-many",
      target: "Course", // Reference the Course entity
      joinTable: {
        name: "user_courses", // The name of the intermediary table
        joinColumn: { name: "userId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "courseId", referencedColumnName: "id" },
      },
    },
  },
});

module.exports = Course;
