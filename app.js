const express = require("express");
const { createConnection, getManager } = require("typeorm");
const Users = require("./model/users");
const usersRouter = require("./routes/users");
const passport = require("passport");
const session = require("express-session");
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
  app.use(express.json());
  app.use("/auth", usersRouter);
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
});
