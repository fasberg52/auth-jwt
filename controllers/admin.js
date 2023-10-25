const Users = require("../model/users");
const Order = require("../model/Orders")
const { getManager } = require("typeorm");

async function getUsers(req, res) {
  try {
    const userRepository = getManager().getRepository(Users);
    const users = await userRepository.find();
    res.json(users);
  } catch (error) {
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
    res
      .status(500)
      .json({ error: "An error occurred while updating the user." });
  }
}

async function deleteUsers(req, res) {
  try {
    const phone = req.params.phone; // Extract the phone number from the request parameters

    await getManager().transaction(async (transactionalEntityManager) => {
      // Find the user you want to delete
      const user = await transactionalEntityManager.findOne(Users, { where: { phone: phone } });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Set the user reference to null for associated orders
      await transactionalEntityManager
        .createQueryBuilder()
        .update(Order)
        .set({ user: null })
        .where("user.phone = :phone", { phone: phone }) // Use phone: phone to pass the parameter
        .execute();

      // Delete the user
      await transactionalEntityManager.remove(Users, user);

      return res.json({ message: "User deleted successfully" });
    });
  } catch (error) {
    console.log(error);
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
