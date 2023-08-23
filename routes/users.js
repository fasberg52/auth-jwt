const express = require("express");
const router = express.Router();
const passport = require("passport");

const usersController = require("../controllers/users");
// const authMiddleware = require("../middleware/authMiddleware");
router.get(
  "/allusers",
  passport.authenticate("jwt", { session: true }),
  (req, res) => {
    res.json({ message: "You have access to this protected route!" });
  },
  usersController.getUsers
);
router.get("/user/:phone", usersController.getUserByPhone);
router.post("/login", usersController.loginUsers);
router.post("/signup", usersController.signUpUsers);
router.put("/update/:phone", usersController.updateUsers);
router.delete(
  "/delete/:phone",
  passport.authenticate("jwt", { session: true }),
  usersController.deleteUsers
);

module.exports = router;
