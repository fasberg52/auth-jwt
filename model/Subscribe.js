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
    userPhone: {
      type: "text",
    },
  },
  relations: {
    user: {
      type: "one-to-one",
      target: "User",
      joinColumn: {
        name: "userPhone",
        referencedColumnName: "phone",
      },
    },
  },
});

module.exports = Subscribe;
