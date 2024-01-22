const Filter = require("../model/Filter");

const { getRepository } = require("typeorm");
const logger = require("../services/logger");
const { filter } = require("compression");
async function createFilter(req, res) {
  try {
    const { name, parentId } = req.body;
    const filterRepository = getRepository(Filter);

    if (parentId) {
      const parentFilter = await filterRepository.findOne({
        where: { id: parentId },
      });

      if (!parentFilter) {
        return res.status(404).json({ error: "والد دسته پیدا نشد" });
      }
      const newFilter = filterRepository.create({
        name,
        parent: parentFilter,
      });

      await filterRepository.save(newFilter);
      const result = {
        id: newFilter.id,
        name: newFilter.name,
      };
      res
        .status(201)
        .json({ message: "با موفقیت ساخته شد", result, status: 201 });
    } else {
      const newFilter = filterRepository.create({
        name,
      });

      await filterRepository.save(newFilter);
      const result = {
        id: newFilter.id,
        name: newFilter.name,
      };
      return res.status(201).json({
        message: "Filter created successfully",
        result,
        status: 201,
      });
    }
  } catch (error) {
    logger.error(`Error in createFilter >> ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllFilters(req, res) {
  try {
    const filterRepository = getRepository(Filter);
    const filters = await filterRepository.find();

    res.status(200).json(filters);
  } catch (error) {
    logger.error(`Error in getAllFilters ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { createFilter, getAllFilters };
