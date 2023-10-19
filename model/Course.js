// Course Entity
const { EntitySchema, Timestamp } = require("typeorm");

const Course = new EntitySchema({
  name: "Course",
  tableName: "courses",
  columns: {
    id: {
      type: "int",
      generated: true,
      primary: true,
    },
    title: {
      type: "varchar",
    },
    description: {
      type: "varchar",
    },
    price: {
      type: "int",
      nullable: true,
    },
    imageUrl: {
      type: "text",
      nullable: true,
    },
    videoUrl: {
      type: "text",
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    lastModified: {
      type: "timestamp",
      onUpdate: "CURRENT_TIMESTAMP",
      nullable: true, // deleted this row when production
    },
  },
  relations: {
    category: {
      // Many-to-One relationship to Category
      type: "many-to-one",
      target: "Category",
    },
   
    users: {
      type: "many-to-many",
      target: "User", // Reference the User entity
      joinTable: {
        name: "user_courses", // The name of the intermediary table
        joinColumn: { name: "courseId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "userId", referencedColumnName: "phone" }, // Reference the "id" column
      },
    },
  },
});

module.exports = Course;
