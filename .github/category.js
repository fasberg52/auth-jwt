// category.js

const { getManager, getRepository } = require("typeorm");
const Category = require("../model/Category");
const fs = require("fs");


async function getAllCategories(req, res) {
  try {
    const categoryRepository = getRepository(Category);

    const categories = await categoryRepository
      .createQueryBuilder("category")
      .select(["category.id", "category.name", "category.parentId"])
      .addSelect(["child.id", "child.name", "child.parentId"])
      .leftJoin("category.children", "child")
      .orderBy("category.id", "ASC")
      .getMany();

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
      const parentRepository = getRepository(Category);
      parentCategory = await parentRepository.findOne({
        where: { id: parent.id },
      });
      if (!parentCategory) {
        return res.status(404).json({ error: "دسته پیدا نشد" });
      }
    }

    const categoryRepository = getRepository(Category);

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

    if (!savedCategory) {
      return res.status(500).json({
        error: "Failed to save the category",
      });
    }

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
