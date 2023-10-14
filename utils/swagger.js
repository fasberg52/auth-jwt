//utils/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const options = {
  swaggerDefinition: {
    info: {
      title: "Your API Title",
      version: "1.0.0",
      description: "Your API Description",
    },
  },
  apis: ["./routes/admin/admin.js","./routes/auth/auth.js"], // Make the path absolute
};

const swaggerSpec = swaggerJSDoc(options);
console.log(swaggerSpec);
module.exports = swaggerSpec;
