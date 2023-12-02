// courseBuilder Entity

const { EntitySchema, PrimaryColumn } = require("typeorm");

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
  },
  parts: {
    type: "one-to-many",
    target: "Part", 
    inverseSide: "chapter",
  
  },
});

module.exports = Chapter;
