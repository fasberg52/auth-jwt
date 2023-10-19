// category.js

const { EntitySchema, Timestamp } = require("typeorm");

const Category = new EntitySchema({
  name: "Category",
  tableName: "categories",
  columns: {
    id: {
      type: "int",
      generated: true,
      primary: true,
     
    },
    name: {
      type: "varchar",

    },
    description: {
      type: "varchar",
      nullable: true,
    },
    icon: {
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
});
module.exports = Category;
