//app.js
const express = require("express");
const { setupDatabase, configureSession } = require("./config/databaseConfig");
const { routerConfig } = require("./config/routerConfig");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const path = require("path");
const bodyParser = require("body-parser");
const { loggerMiddleware } = require("./middleware/loggerMiddleware");
const dotenv = require("dotenv").config();
const { sendNotifications } = require("./utils/notifications");
const app = express();

app.disable("x-powered-by");

async function main() {
  try {
    await setupDatabase();

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));

    // Use bodyParser before the session configuration
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.json());

    // Enable CORS before other middleware
    app.use(
      cors({
        origin: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
      })
    );

    configureSession(app);

    app.use(cookieParser());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use("/app/uploads", express.static("uploads"));
    app.use("/public", express.static("public"));
    app.use(loggerMiddleware);

 
    app.use(compression());


    routerConfig(app);

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error setting up the application:", error);
  }
}
main();
