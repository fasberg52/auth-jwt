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
<<<<<<< HEAD
=======

>>>>>>> 49214696cbf347cd1155ad8188b1e83207f66417
const app = express();

app.disable("x-powered-by");


<<<<<<< HEAD
=======


>>>>>>> 49214696cbf347cd1155ad8188b1e83207f66417
async function main() {
  try {
    await setupDatabase();
    configureSession(app);
    app.set("trust proxy", 1);

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(cookieParser());

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.json());
    app.use("/app/uploads", express.static("uploads"));
    app.use("/public", express.static("public"));
    app.use(loggerMiddleware);
    app.use(
      cors({
        // origin: "*",
        origin: [
          "https://baclass.iran.liara.run",
          "https://beta.balcass.online",
          "http://192.168.1.113",
          "http://192.168.1.113:5173",
        ],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
      })
    );
<<<<<<< HEAD
=======
    app.use(compression());
>>>>>>> 49214696cbf347cd1155ad8188b1e83207f66417

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
