// model/upload.js

const { EntitySchema } = require("typeorm");
const Upload = new EntitySchema({
  name: "Upload",
  tableName: "upload",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    path: {
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
  },
});

module.exports = Upload;
