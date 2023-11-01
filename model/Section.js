// courseBuilder Entity

const { EntitySchema, PrimaryColumn } = require("typeorm");

const Section = new EntitySchema({
  name: "Section",
  tableName: "sections",
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
    },
  },
});

module.exports = Section;
