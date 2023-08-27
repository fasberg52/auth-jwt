const express = require("express");
const { createConnection, getManager } = require("typeorm");
const Users = require("./model/users");
const authRouter = require("./routes/auth/auth");
const adminRouter = require("./routes/admin/admin");
const passport = require("passport");
const session = require("express-session");
var bodyParser = require("body-parser");

const dotenv = require("dotenv").config();
const app = express();

async function setupDatabase() {
  await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "2434127reza",
    database: "postgres",
    entities: [Users],
    synchronize: true,
  });
}

setupDatabase().then(() => {
  const userRepository = getManager().getRepository(Users);
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


  //routes

  app.use("/auth", authRouter);
  app.use("/admin", adminRouter);
  app.listen(process.env.PORT, () => {
    console.log("Server is running on port 3000");
  });
});
