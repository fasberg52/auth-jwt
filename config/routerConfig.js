//config/routerConfig.js
const authRouter = require("../routes/auth/auth");
const adminRouter = require("../routes/admin/admin");
const cartRouter = require("../routes/shop/cart");
const courseRouter = require("../routes/shop/course");
const courseAdminrouter = require("../routes/admin/courseAdmin");
const uploadRouter = require("../routes/admin/upload");
const orderRouter = require("../routes/shop/order");
const cacheRouter = require("../routes/admin/cache");
const userRouter = require("../routes/shop/user");
const excelRouter = require("../routes/admin/excel");
const categoryRouter = require("../routes/shop/category");
const onlineCourseAdminRouter = require("../routes/admin/onlineCourseAdmin")
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("../utils/swagger");

async function routerConfig(app) {
  //swagger api
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Routes
  app.use("/auth", authRouter);
  app.use("/admin", adminRouter);
  app.use("/course", courseRouter);
  app.use("/", cartRouter);
  app.use("/course", courseAdminrouter);
  app.use("/", uploadRouter);
  app.use("/", orderRouter);
  app.use("/cache", cacheRouter);
  app.use("/", userRouter);
  app.use("/category", categoryRouter);
  app.use("/excel", excelRouter);
  app.use("/online-course", onlineCourseAdminRouter);

}

module.exports = {
  routerConfig,
};
