const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      type: "int",
      generated: true,
    },
    firstName: {
      type: "varchar",
    },
    lastName: {
      type: "varchar",
    },
    phone: {
      type: "text",
      primary: true,
    },
    password: {
      type: "text",
    },
  },
});

module.exports = User;
