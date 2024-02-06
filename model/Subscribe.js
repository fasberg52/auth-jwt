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
    subscribe: {
      type: "jsonb",
    },
  },
});

module.exports = Subscribe;
