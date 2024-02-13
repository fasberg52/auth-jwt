const { createConnection, getManager } = require("typeorm");
const Users = require("../model/users");
const OTP = require("../model/OTP");
const Course = require("../model/Course");
const Order = require("../model/Orders");
const Category = require("../model/Category");
const Session = require("../model/Session");
const Cart = require("../model/Cart");
const CartItems = require("../model/CartItems");
const Part = require("../model/Part");
const Chapter = require("../model/Chapter");
const Upload = require("../model/Upload");
const Enrollment = require("../model/Enrollment");
const Tags = require("../model/Tags");
const SecureLink = require("../model/secureLink");
const Coupon = require("../model/Coupon");
const Filter = require("../model/Filter");
const OnlineClass = require("../model/onlineCourse");
const Subscribe = require("../model/Subscribe");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const dotenv = require("dotenv");

async function setupDatabase() {
  try {
    await createConnection({
      type: "postgres",
      host: process.env.DATABASE_URL,
      port: process.env.PORT_PG_DB,
      username: process.env.USERNAME_PG_DB,
      password: process.env.PASSWORD_PG_DB,
      database: process.env.DATABASE_PG_DB,
      entities: [
        Users,
        OTP,
        Course,
        Order,
        Category,
        Session,
        Cart,
        CartItems,
        Chapter,
        Part,
        Upload,
        Enrollment,
        Tags,
        SecureLink,
        Coupon,
        Filter,
        OnlineClass,
        Subscribe,
      ],
      synchronize: false,
    });

    console.log("Database connection established");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
}
async function configureSession(app) {
  app.use(
    session({
      store: new PgSession({
        conObject: {
          // Use your PostgreSQL connection settings here
          user: process.env.USERNAME_PG_DB,
          host: process.env.DATABASE_URL,
          database: process.env.DATABASE_PG_DB,
          password: process.env.PASSWORD_PG_DB,
          port: process.env.PORT_PG_DB,
        },
        tableName: "session",
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );
  // app.use(
  //   session({
  //     secret: process.env.SESSION_SECRET,
  //     resave: false,
  //     saveUninitialized: false,
  //   })
  // );
}
module.exports = {
  setupDatabase,
  configureSession,
};
