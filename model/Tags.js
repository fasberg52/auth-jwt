// Tags.js

const { EntitySchema } = require("typeorm");

const Tag = new EntitySchema({
  name: "Tag",
  tableName: "tags",
  columns: {
    id: {
      type: "int",
      generated: true,
      primary: true,
    },
    data: {
      type: "json",
      nullable: false,
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
});

module.exports = Tag;