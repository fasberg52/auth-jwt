const { EntitySchema, PrimaryColumn } = require("typeorm");
const Part = require("../model/Part"); // Make sure the path is correct

const Chapter = new EntitySchema({
  name: "Chapter",
  tableName: "chapters",
  columns: {
    id: {
      type: "int",
      generated: true,
      primary: true,
    },
    courseId: {
      type: "int",
    },
    title: {
      type: "varchar",
    },
    orderIndex: {
      type: "int",
      default: 0,
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
    course: {
      type: "many-to-one",
      target: "Course",
      joinColumn: true,
    },
    parts: {
      type: "one-to-many",
      target: "Part",
      inverseSide: "chapter",
    },
  },
  methods: {
    get videoPath() {
      const freePart = this.parts.find(part => part.isFree);
      return freePart ? freePart.videoPath : null;
    },
  },
});

module.exports = Chapter;