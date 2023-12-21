// category.js

const { getManager } = require("typeorm");
const Category = require("../model/Category");
const fs = require("fs");
const multer = require("multer");
const moment = require("jalali-moment");
const upload = multer({ dest: "uploads/" });

async function getAllCategories(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    const sortBy = req.query.sortBy || "id";
    const sortOrder = req.query.sortOrder || "DESC";

    const categoryRepository = getManager().getRepository(Category);
    const [categories, totalCount] = await categoryRepository.findAndCount({
      skip,
      take: pageSize,
      order: {
        [sortBy]: sortOrder,
      },
    });

    const data = categories.map((category) => {
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        createdAt: category.createdAt
          ? moment(category.createdAt).format("jYYYY/jMM/jDD")
          : null,
        lastModified: category.lastModified
          ? moment(category.lastModified).format("jYYYY/jMM/jDD")
          : null,
      };
    });

    res.status(200).json({ data, totalCount, status: 200 });
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
