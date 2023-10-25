// Session.js
const { EntitySchema } = require("typeorm");

const Session = new EntitySchema({
  name: "Session",
  tableName: "session",
  columns: {
    sid: {
      primary: true,
      type: "varchar",
    },
    sess: {
      type: "json",
    },
    expire: {
      type: "timestamp",
    },
  },
});

module.exports = Session;
