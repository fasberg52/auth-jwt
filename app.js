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

const fs = require("fs");
const app = express();

app.disable("x-powered-by");

async function main() {
  try {
    await setupDatabase();

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.json());

    app.use(
      cors({
        origin: [
          "https://baclass.iran.liara.run",
          "https://beta.balcass.online",
          "http://192.168.1.113",
          "http://192.168.1.113:3630",
          "https://192.168.100.12:3630",
          "http://192.168.100.12:3630",
          "http://localhost:3630",
          "http://localhost:4173",
          "http://192.168.1.195:4173",
          "https://event.alocom.co",
          "http://127.0.0.1:5500/index.html",
          "https://baclassonline.liara.run",
        ],
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
