const { EntitySchema } = require("typeorm");

const UserPart = new EntitySchema({
  name: "UserPart",
  tableName: "user_parts",
  columns: {
    phone: {
      type: "text",
      primary: true,
    },
    partId: {
      type: "int",
      primary: true,
    },
    isRead: {
      type: "boolean",
      default: false,
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      type: "timestamp",
      onUpdate: "CURRENT_TIMESTAMP",
      nullable: true,
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "phone", referencedColumnName: "phone" },
    },
    part: {
      type: "many-to-one",
      target: "Part",
      joinColumn: { name: "partId", referencedColumnName: "id" },
    },
  },
});

module.exports = UserPart;
