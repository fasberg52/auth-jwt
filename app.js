//app.js
const express = require("express");
const { setupDatabase, configureSession } = require("./config/databaseConfig");
const { routerConfig } = require("./config/routerConfig");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const multer = require("multer");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const app = express();
app.disable("x-powered-by");

async function main() {
  try {
    await setupDatabase();
    configureSession(app);
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(cookieParser());

    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(express.json());

    app.use(cors());
    
    rateLimterConfig(app);

    routerConfig(app);

    // Start the server
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error setting up the application:", error);
  }
}

main();
