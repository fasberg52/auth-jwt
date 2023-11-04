// courseBuilder Entity

const { EntitySchema, PrimaryColumn } = require("typeorm");

const Part = new EntitySchema({
  name: "Part",
  tableName: "parts",
  columns: {
    id: {
      type: "int",
      generated: true,
      primary: true,
    },
    chapterId:{
      type:"int"
    },
    title: {
      type: "varchar",
    },
    description: {
      type: "varchar",
    },
    icon: {
      type: "varchar",
    },
    videoPath: {
      type: "varchar",
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
    chapter: {
      type: "many-to-one",
      target: "Chapter",
      joinColumn: true,
    },
  },
});

module.exports = Part;
