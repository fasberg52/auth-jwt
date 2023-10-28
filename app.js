//app.js
const express = require("express");
const { createConnection, getManager } = require("typeorm");
const { setupDatabase ,configureSession} = require("./config/databaseConfig");
const authRouter = require("./routes/auth/auth");
const adminRouter = require("./routes/admin/admin");
const cartRouter = require("./routes/shop/cart");
const courseRouter = require("./routes/shop/course");

const swaggerSpec = require("./utils/swagger");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const multer = require("multer");
const session = require("express-session");
var bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express"); // Import swaggerUi

const PgSession = require("connect-pg-simple")(session);

const dotenv = require("dotenv").config();
const app = express();

async function main() {
  try {
    await setupDatabase();
    configureSession(app);
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(cookieParser());

    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(express.json());

    //swagger api
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Routes
    app.use("/auth", authRouter);
    app.use("/admin", adminRouter);
    app.use("/course", courseRouter);
    app.use("/", cartRouter);
    // Start the server
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error setting up the application:", error);
  }
}

main();
