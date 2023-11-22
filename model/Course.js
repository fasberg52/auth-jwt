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
    discountPrice: {
      type: "int",
      nullable: true,
    },
    discountStart: {
      type: "timestamp",
      nullable: true,
    },
    discountExpiration: {
      type: "timestamp", // Assuming your database supports timestamp
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
      nullable: true,
    },
  },
  relations: {
    category: {
      type: "many-to-one",
      target: "Category", // Target entity name
      joinColumn: { name: "categoryId", referencedColumnName: "id" }, // Specify the join column
    },

    users: {
      type: "many-to-many",
      target: "User",
      joinTable: {
        name: "user_courses",
        joinColumn: { name: "courseId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "userId", referencedColumnName: "phone" },
      },
    },
  },
});

module.exports = Course;
