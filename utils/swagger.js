//utils/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const options = {
  swaggerDefinition: {
    info: {
      title: "Baclass Online",
      version: "1.0.0",
      description: "State One Project",
    },
  },
  apis: ["./routes/admin/admin.js","./routes/auth/auth.js","./routes/shop/*.js"], // Make the path absolute
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
