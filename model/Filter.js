//model/Filter.js

const { EntitySchema } = require("typeorm");

const Filter = new EntitySchema({
  name: "Filter",
  tableName: "filters",
  columns: {
    id: {
      type: "int",
      generated: true,
      primary: true,
    },
    name: {
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
    parent: {
      type: "many-to-one",
      target: "Filter",
      inverseSide: "children",
      nullable: true,
    },
    children: {
      type: "one-to-many",
      target: "Filter",
      inverseSide: "parent",
    },
  },
});

module.exports = Filter;
