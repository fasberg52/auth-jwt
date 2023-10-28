
const authRouter = require("../routes/auth/auth");
const adminRouter = require("../routes/admin/admin");
const cartRouter = require("../routes/shop/cart");
const courseRouter = require("../routes/shop/course");
const swaggerUi = require("swagger-ui-express"); // Import swaggerUi

const swaggerSpec = require("../utils/swagger");

async function routerConfig(app) {
  //swagger api
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Routes
  app.use("/auth", authRouter);
  app.use("/admin", adminRouter);
  app.use("/course", courseRouter);
  app.use("/", cartRouter);
}

module.exports = {
  routerConfig,
};
