const express = require("express");
const { createConnection, getManager } = require("typeorm");
const Users = require("./model/users");
const OTP = require("./model/OTP");
const Course = require("./model/Course");
const authRouter = require("./routes/auth/auth");
const adminRouter = require("./routes/admin/admin");
const courseRouter = require("./routes/shop/course");
const passport = require("passport");
const multer = require("multer");
const session = require("express-session");
var bodyParser = require("body-parser");

const dotenv = require("dotenv").config();
const app = express();

async function setupDatabase() {
  try {
    await createConnection({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "2434127reza",
      database: "postgres",
      entities: [Users, OTP, Course],
      synchronize: true,
    });

    console.log("Database connection established");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}

async function main() {
  try {
    await setupDatabase();

    const userRepository = getManager().getRepository(Users);
    const otpRepository = getManager().getRepository(OTP);
    const courseRepository = getManager().getRepository(Course);
    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
      })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(bodyParser.urlencoded({ extended: false }));

    app.use(express.json());

 

    // Routes
    app.use("/auth", authRouter);
    app.use("/admin", adminRouter);
    app.use("/course", courseRouter);
    // Start the server
    app.listen(process.env.PORT, () => {
      console.log("Server is running on port 3000");
    });
  } catch (error) {
    console.error("Error setting up the application:", error);
  }
}

main();
