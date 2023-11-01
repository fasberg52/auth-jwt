// courseBuilder Entity

const { EntitySchema, PrimaryColumn } = require("typeorm");

const CourseBuilder = new EntitySchema({
  name: "CourseBuilder",
  tableName: "courseBuilder",
  columns: {
    id: {
      type: "int",
      generated: true,
      primary: true,
    },
    part: {
      type: "json",
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

module.exports = CourseBuilder;
