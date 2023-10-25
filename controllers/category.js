// category.js

const { getManager } = require("typeorm");
const Category = require("../model/Category");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

async function getAllCategories(req, res) {
  try {
    const categoryRepository = getManager().getRepository(Category);
    const categories = await categoryRepository.find();
    res.json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching categories." });
  }
}

async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    const icon = req.file ? req.file.filename : null; 
    const categoryRepository = getManager().getRepository(Category);
    const newCategory = categoryRepository.create({ name, description, icon });
    const savedCategory = await categoryRepository.save(newCategory);
    res.status(201).json(savedCategory);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the category." });
  }
}

async function updateCategory(req, res) {
  try {
    const categoryId = req.params.categoryId;
    const { name, description } = req.body;
    const categoryRepository = getManager().getRepository(Category);
    const existingCategory = await categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found." });
    }

    existingCategory.name = name;
    existingCategory.description = description;

    if (req.file) {
      existingCategory.icon = req.file.filename;
    }

    existingCategory.lastModified = new Date();

    const updatedCategory = await categoryRepository.save(existingCategory);
    res.json(updatedCategory);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the category." });
  }
}

async function deleteCategory(req, res) {
  try {
    const categoryId = req.params.categoryId;
    const categoryRepository = getManager().getRepository(Category);
    const existingCategory = await categoryRepository.findOne({
      where: { id : categoryId },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found." });
    }

    if (existingCategory.icon) {
      const iconFilePath = `uploads/${existingCategory.icon}`;
      if (fs.existsSync(iconFilePath)) {
        fs.unlinkSync(iconFilePath);
      }
    }

    await categoryRepository.remove(existingCategory);
    res.json({ message: "Category deleted successfully." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the category." });
  }
}

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
