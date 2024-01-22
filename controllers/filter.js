const Filter = require("../model/Filter");

const { getRepository } = require("typeorm");
const logger = require("../services/logger");
async function createFilter(req, res) {
  try {
    const { name, children } = req.body;

    const filterRepository = getRepository(Filter);

    let parentFilter = null;

    if (name) {
      parentFilter = filterRepository.create({
        name,
      });

      await filterRepository.save(parentFilter);
    }

    if (children && children.length > 0) {
      const childFilters = children.map((child) =>
        filterRepository.create({
          name: child.name,
          parent: parentFilter,
        })
      );

      await filterRepository.save(childFilters);
    }

    res.status(201).json({
      message: "با موفقیت ساخته شد",
      status: 201,
    });
  } catch (error) {
    logger.error(`Error in createFilter >> ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function editFilter(req, res) {
  try {
    const { id, name, children } = req.body;

    const filterRepository = getRepository(Filter);

    const existingFilter = await filterRepository.findOne(id);

    if (!existingFilter) {
      return res.status(404).json({ error: "Filter not found" });
    }

    existingFilter.name = name;

    const updatedFilter = await filterRepository.save(existingFilter);

    // Add new child filters
    if (children && children.length > 0) {
      const childFilters = children.map((child) =>
        filterRepository.create({
          name: child.name,
          parent: updatedFilter,
        })
      );

      await filterRepository.save(childFilters);
    }

    res.status(200).json({
      message: "Filter updated successfully",
      updatedFilter,
      status: 200,
    });
  } catch (error) {
    logger.error(`Error in editFilter >> ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getAllFilters(req, res) {
  try {
    const filterRepository = getRepository(Filter);

    const filtersWithHierarchy = await filterRepository
      .createQueryBuilder("filter")
      .leftJoin("filter.children", "children")
      .select(["filter.id", "filter.name", "children.id", "children.name"])
      .where("filter.parent IS NULL")
      .getMany();

    res.status(200).json({ filters: filtersWithHierarchy });
  } catch (error) {
    logger.error(`Error in getAllFilters >> ${error}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = { createFilter, getAllFilters, editFilter };
