// quiz Entity

const { EntitySchema } = require("typeorm");
const AzmoonType = {
  AZMOON: "azmoon",
};
const Quiz = new EntitySchema({
  name: "Quiz",
  tableName: "quizes",
  columns: {
    id: {
      type: "int",
      generated: true,
      primary: true,
    },
    examCode: {
      type: "int",
      nullable: true,
    },
    examTitle: {
      type: "varchar",
      nullable: true,
    },
    examPrice: {
      type: "int",
      nullable: true,
    },
    start: {
      type: "timestamp",
      nullable: true,
    },
    end: {
      type: "timestamp",
      nullable: true,
    },
    expireTime: {
      type: "int",
      nullable: true,
    },
    examType: {
      type: "enum",
      enum: ["test", "explain"],
      nullable: true,
    },
    itemType: {
      type: "enum",
      enum: Object.values(AzmoonType),
      default: AzmoonType.AZMOON,
    },
  },
  relations: {
    enrollments: {
      type: "one-to-many",
      target: "Enrollment",
      inverseSide: "quiz",
    },
  },
});

module.exports = Quiz;
