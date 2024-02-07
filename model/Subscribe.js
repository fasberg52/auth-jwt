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
  },
});

module.exports = Subscribe;
