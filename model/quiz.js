// quiz Entity

const { EntitySchema } = require("typeorm");

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
    },
  },
});

module.exports = Quiz;
