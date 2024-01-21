// category.js

const { getManager, getRepository,createTrees } = require("typeorm");
const Category = require("../model/Category");
const fs = require("fs");
const multer = require("multer");
const moment = require("jalali-moment");
const upload = multer({ dest: "uploads/" });

async function getAllCategories(req, res) {
  try {
    const categoryRepository = getRepository(Category);
    const categories = await categoryRepository.find({
      relations: ["parent", "children"],
    });

    res.status(200).json({ categories, status: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}



// async function createCategory(req, res) {
//   try {
//     const { name, description, icon } = req.body;
//     const categoryRepository = getManager().getRepository(Category);
//     const newCategory = categoryRepository.create({ name, description, icon });
//     const savedCategory = await categoryRepository.save(newCategory);
//     res
//       .status(201)
//       .json({ message: "با موفقیت ساخته شد", savedCategory, status: 201 });
//   } catch (error) {
//     res.status(500).json({
//       error: "Internal Server Error",
//     });
//   }
// }

async function createCategory(req, res) {
  try {
    const { name, description, icon, parent } = req.body;

    let parentCategory = null;
    if (parent && parent.id) {
      const parentRepository = getManager().getRepository(Category);
      parentCategory = await parentRepository.findOne({
        where: { id: parent.id },
      });
      if (!parentCategory) {
        return res.status(404).json({ error: "دسته واد پیدا نشد" });
      }
    }
    const categoryRepository = getManager().getRepository(Category);

    const newCategory = categoryRepository.create({
      name,
      description,
      icon,
      parent: parentCategory,
    });

    if (parentCategory) {
      newCategory.parentName = parentCategory.name;
    }

    const savedCategory = await categoryRepository.save(newCategory);

    res
      .status(201)
      .json({ message: "با موفقیت ساخته شد", savedCategory, status: 201 });
  } catch (error) {
    console.error(error);
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
