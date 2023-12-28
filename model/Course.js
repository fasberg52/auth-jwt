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
      type: "text",
      nullable: true,
    },
    price: {
      type: "int",
      nullable: true,
    },
    discountPrice: {
      type: "int",
      default: null,
      nullable: true,
    },
    discountStart: {
      type: "timestamp",
      nullable: true,
    },
    discountExpiration: {
      type: "timestamp",
      nullable: true,
    },
    imageUrl: {
      type: "varchar",
      nullable: true,
    },
    bannerUrl: {
      type: "varchar",
      nullable: true,
    },
    videoUrl: {
      type: "text",
      nullable: true,
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
      target: "Category",
      joinColumn: { name: "categoryId", referencedColumnName: "id" },
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
    chapters: {
      type: "one-to-many",
      target: "Chapter",
      inverseSide: "course",
    },
    parts: {
      type: "one-to-many",
      target: "Part",
      inverseSide: "course",
    },
    enrollments: {
      type: "one-to-many",
      target: "Enrollment",
      inverseSide: "course",
    },
  },
});

module.exports = Course;
