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
    name: {
      type: "varchar",
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
  relations:{
    category: {
      type: "many-to-one",
      target: "Category", // Target entity name
      joinColumn: { name: "categoryId", referencedColumnName: "id" }, // Specify the join column
    },
  }
});

module.exports = Tag;