// courseBuilder Entity

const { EntitySchema, PrimaryColumn } = require("typeorm");

const Part = new EntitySchema({
  name: "Part",
  tableName: "parts",
  columns: {
    id: {
      type: "int",
      generated: true,
      primary: true,
    },
    chapterId: {
      type: "int",
    },
    title: {
      type: "varchar",
    },
    description: {
      type: "varchar",
    },
    icon: {
      type: "varchar",
      nullable: true,
    },

    videoPath: {
      type: "varchar",
    },
    videoDuration: {
      type: "varchar",
      nullable: true,
    },
    isFree: {
      type: "boolean",
      default: false,
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
    secureLinkId: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    chapter: {
      type: "many-to-one",
      target: "Chapter",
      joinColumn: true,
    },
    secureLink: {
      type: "many-to-one",
      target: "SecureLink",
      joinColumn: { name: "secureLinkId", referencedColumnName: "id" },
    },
  },
});

module.exports = Part;
