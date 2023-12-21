const { EntitySchema, Timestamp, ManyToOne, OneToMany } = require("typeorm");

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
    parentName: {
      type: "varchar",
      nullable: true,
    },
  },
  relations: {
    parent: {
      type: "ManyToOne",
      target: "Category",
      inverseSide: "children",
      nullable: true,
    },
    children: {
      type: "OneToMany",
      target: "Category",
      inverseSide: "parent",
    },
  },
});

module.exports = Category;