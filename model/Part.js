// courseBuilder Entity

const { EntitySchema } = require("typeorm");

const Part = new EntitySchema({
  name: "Part",
  tableName: "parts",
  columns: {
    id: {
      type: "int",
      generated: true,
      primary: true,
    },
    chapterId: {
      type: "int",
    },
    title: {
      type: "varchar",
    },
    description: {
      type: "varchar",
    },
    icon: {
      type: "varchar",
      nullable: true,
    },

    videoPath: {
      type: "varchar",
    },
    videoDuration: {
      type: "varchar",
      nullable: true,
      default: null,
    },
    isFree: {
      type: "boolean",
      default: false,
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
    secureLinkId: {
      type: "int",
      nullable: true,
    },
    courseId: {
      type: "int",
      nullable: true,
    },

    orderIndex: {
      type: "int",
      default: 0,
    },
    videoType: {
      type: "enum",
      enum: ["embed", "normal"],
      nullable: true,
    },
  },

  relations: {
    chapter: {
      type: "many-to-one",
      target: "Chapter",
      joinColumn: true,
    },
    course: {
      type: "many-to-one",
      target: "Course",
      joinColumn: { name: "courseId", referencedColumnName: "id" },
    },
    secureLink: {
      type: "many-to-one",
      target: "SecureLink",
      joinColumn: { name: "secureLinkId", referencedColumnName: "id" },
    },
  },
});

module.exports = Part;
