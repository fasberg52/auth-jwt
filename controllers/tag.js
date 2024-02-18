const { getRepository } = require("typeorm");
const Tags = require("../model/Tags");
const Category = require("../model/Category");

const getAllTags = async (req, res) => {
  const tagRepository = getRepository(Tags);
  try {
    const tags = await tagRepository.find();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getTagById = async (req, res) => {
  const tagId = req.params.id;
  const tagRepository = getRepository(Tags);
  try {
    const tag = await tagRepository.findOne(tagId);
    if (!tag) {
      res.status(404).json({ error: "Tag not found" });
    } else {
      res.json(tag);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function createTag(req, res) {
  try {
    const categoryId = req.params.id;
    const { name } = req.body;
    const categoryRepository = getRepository(Category);

    // Ensure to await the findOne method
    const existingCategory = await categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return res
        .status(404)
        .json({ error: "This category does not exist", status: 404 });
    }

    const tagRepository = getRepository(Tags);
    const newTag = tagRepository.create({ name });

    // Associate the tag with the existing category
    newTag.category = existingCategory;

    // Save the newTag with the associated category
    await tagRepository.save(newTag);

    res.status(201).json({ newTag, status: 200 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const updateTag = async (req, res) => {
  const tagId = req.params.id;
  const updatedTagData = req.body;
  const tagRepository = getRepository(Tags);

  try {
    await tagRepository.update(tagId, updatedTagData);
    const updatedTag = await tagRepository.findOne(tagId);
    if (!updatedTag) {
      res.status(404).json({ error: "Tag not found" });
    } else {
      res.json(updatedTag);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteTag = async (req, res) => {
  const tagId = req.params.id;
  const tagRepository = getRepository(Tags);

  try {
    const tag = await tagRepository.findOne(tagId);
    if (!tag) {
      res.status(404).json({ error: "tag not found" });
    } else {
      await tagRepository.remove(tag);
      res.status(204).send();
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
};
