const { getRepository } = require("typeorm");
const Tags = require("../model/Tags"); 


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
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const createTag = async (req, res) => {
  const newTagData = req.body;
  const tagRepository = getRepository(Tags);
  const newTag = tagRepository.create(newTagData);

  try {
    await tagRepository.save(newTag);
    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

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
