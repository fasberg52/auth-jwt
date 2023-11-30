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
    originalLink: { 
      type: "varchar",
    },
    token: {
      type: "varchar", 
    },
  },
});

module.exports = SecureLink;
