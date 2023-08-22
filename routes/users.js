const express = require("express");
const router = express.Router();
const passport = require("passport");

const usersController = require("../controllers/users");
// const authMiddleware = require("../middleware/authMiddleware");
router.get(
  "/allusers",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ message: "You have access to this protected route!" });
  },
  usersController.getUsers
);
router.get("/user/:phone", usersController.getUserByPhone);
router.post("/login", usersController.loginUsers);
router.post("/signup", usersController.postUsers);
router.put("/update/:phone", usersController.updateUsers);
router.delete("/delete/:phone", usersController.deleteUsers);

module.exports = router;
