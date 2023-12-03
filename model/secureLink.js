const { EntitySchema } = require("typeorm");

const SecureLink = new EntitySchema({
  name: "SecureLink",
  tableName: "secureLinks", // Adjust the table name if needed
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    partId: {
      type: "int",
      nullable: true,
    },
    token: {
      type: "varchar",
    },
  },
  relations: {
    part: {
      type: "many-to-one",
      target: "Part",
      joinColumn: { name: "partId", referencedColumnName: "id" },
    },
  },
});

module.exports = SecureLink;
