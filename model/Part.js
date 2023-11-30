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
  relations: {
    chapter: {
      type: "many-to-one",
      target: "Chapter",
      joinColumn: true,
    },
    secureLinkId: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    secureLink: {
      type: "many-to-one",
      target: "SecureLink", // Assuming SecureLink is the correct name of your entity
      joinColumn: { name: "secureLinkId", referencedColumnName: "id" },
    },
  },
});

module.exports = Part;
