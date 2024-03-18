const { EntitySchema } = require("typeorm");

const Subscribe = new EntitySchema({
  name: "Subscribe",
  tableName: "subscribe",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    endpoint: {
      type: "varchar",
    },
    auth: {
      type: "varchar",
    },
    p256dh: {
      type: "varchar",
    },
    isActive: {
      type: "boolean",
      default: false,
    },
    userPhone: {
      type: "text",
      nullable: true,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "userPhone",
        referencedColumnName: "phone",
      },
      cascade: true,
      onDelete: "CASCADE",
    },
  },
});

module.exports = Subscribe;
