//app.js
const express = require("express");
const { createConnection, getManager } = require("typeorm");
const Users = require("./model/users");
const OTP = require("./model/OTP");
const Course = require("./model/Course");
const Order = require("./model/Orders");
const Category = require("./model/Category");
const Session = require("./model/Session");
const Cart = require("./model/Cart");
const CartItems = require("./model/CartItems");

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

async function setupDatabase() {
  try {
    await createConnection({
      type: "postgres",
      host: process.env.DATABASE_URL,
      port: process.env.PORT_PG_DB,
      username: process.env.USERNAME_PG_DB,
      password: process.env.PASSWORD_PG_DB,
      database: process.env.DATABASE_PG_DB,
      entities: [Users, OTP, Course, Order, Category, Session, Cart, CartItems],
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
    const orderRepository = getManager().getRepository(Order);
    const categoryItemRepository = getManager().getRepository(Category);
    const cartRepository = getManager().getRepository(Cart);
    const cartItemsRepository = getManager().getRepository(CartItems);
    const sessionRepository = getManager().getRepository(Session);
    app.use(cookieParser());
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

    app.use(passport.initialize());
    app.use(passport.session());

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
