const Users = require("../model/users");
const { getManager } = require("typeorm");

async function getUsers(req, res) {
  try {
    const userRepository = getManager().getRepository(Users);
    const users = await userRepository.find();
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "An error occurred while getting users." });
  }
}

async function getUserByPhone(req, res) {
  try {
    const userRepository = getManager().getRepository(Users);
    const phoneNumber = req.params.phone;

    const existingUser = await userRepository.findOne({
      where: { phone: phoneNumber },
    });

    if (existingUser) {
      res.json(existingUser);
    } else {
      res.status(404).json({ error: "User not found." });
    }
  } catch (error) {
    console.error("Error getting user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while getting the user." });
  }
}

async function updateUsers(req, res) {
  try {
    const userRepository = getManager().getRepository(Users);
    const phoneNumber = req.params.phone;

    const existingUser = await userRepository.findOne({
      where: { phone: phoneNumber },
    });

    if (existingUser) {
      existingUser.firstName = req.body.firstName;
      existingUser.lastName = req.body.lastName;
      existingUser.password = req.body.password;

      const savedUser = await userRepository.save(existingUser);
      res.json(savedUser);
    } else {
      res.status(404).json({ error: "User not found." });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the user." });
  }
}

async function deleteUsers(req, res) {
  try {
    const userRepository = getManager().getRepository(Users);
    const phoneNumber = req.params.phone;

    const existingUser = await userRepository.findOne({
      where: { phone: phoneNumber },
    });

    if (existingUser) {
      await userRepository.remove(existingUser);
      res.json({ message: "User deleted successfully." });
    } else {
      res.status(404).json({ error: "User not found." });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the user." });
  }
}

module.exports = {
  getUsers,
  getUserByPhone,
  updateUsers,
  deleteUsers,
};
