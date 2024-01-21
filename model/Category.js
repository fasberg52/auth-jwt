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
      default: null,
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
    parentId: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    parent: {
      type: "many-to-one",
      target: "Category",
      inverseSide: "children",
      nullable: true,
    },
    children: {
      type: "one-to-many",
      target: "Category",
      inverseSide: "parent",
    },
  },
});

module.exports = Category;
