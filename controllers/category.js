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
    res
      .status(201)
      .json({ message: "با موفقیت ساخته شد", savedCategory, status: 201 });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
    });
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
      return res.status(404).json({ error: "دسته ای پیدا نشد", status: 404 });
    }

    existingCategory.name = name;
    existingCategory.description = description;

    if (req.file) {
      existingCategory.icon = req.file.filename;
    }

    existingCategory.lastModified = new Date();

    const updatedCategory = await categoryRepository.save(existingCategory);
    res.json({
      message: "با موفقیت بروز رسانی شد",
      updatedCategory,
      status: 200,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteCategory(req, res) {
  try {
    const categoryId = req.params.categoryId;
    const categoryRepository = getManager().getRepository(Category);
    const existingCategory = await categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: "دسته ای پیدا نشد", status: 404 });
    }

    if (existingCategory.icon) {
      const iconFilePath = `uploads/${existingCategory.icon}`;
      if (fs.existsSync(iconFilePath)) {
        fs.unlinkSync(iconFilePath);
      }
    }

    await categoryRepository.remove(existingCategory);
    res.json({ message: "دسته پاک شد", status: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
